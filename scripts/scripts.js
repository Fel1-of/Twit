
class FetchData {
    getResourse = async url => {
        const res = await fetch(url);

        if (!res.ok) {//создание ошибки
            throw new Error('Pipec' + res.status)
        }

        return res.json();
    } 

    getPost = () => this.getResourse('db/database.json');
}

// new fetchData().getPost().then((data) => {
//     console.log(data)
// });

//Привет проверяющим))) Расслабьтесь: https://www.youtube.com/watch?v=HzbH2UfArp4&t=0s

class Twitter{
    constructor({
        user, 
        listElem, 
        modalElems, 
        tweetElems, 
        avatarElems,
        classDeleteTweet,
        classLikeTweet,
        sortElem,
        showUserPostElem,
        showLikedPostElem}){//деструктурирование
        const fetchData = new FetchData()
        this.user = user; 
        this.tweets = new Posts();
        this.elements = {
            listElem: document.querySelector(listElem),
            sortElem: document.querySelector(sortElem),
            showUserPostElem: document.querySelector(showUserPostElem),
            showLikedPostElem: document.querySelector(showLikedPostElem),
            modal: modalElems,
            tweetElems,
            avatarElems,

        };

        this.class = {
            classDeleteTweet,
            classLikeTweet
        }

        this.sortDate = true;

        fetchData.getPost()
            .then(data => {
                //const self = this;
                data.forEach(this.tweets.addPost);
                this.showAllPost();

                
            });
        
            this.elements.modal.forEach(this.handlerModal, this);       //(elem) => this.hendlerModal(elem))
            this.elements.tweetElems.forEach(this.addTweet, this); 

            this.elements.listElem.addEventListener('click', this.handlerTweet);
            this.elements.sortElem.addEventListener('click', this.changeSort);
            
            this.elements.showLikedPostElem.addEventListener('click', this.showLikedPost)
            this.elements.showUserPostElem.addEventListener('click', this.showUserPost)
            
            
            this.changeAvatar(this.elements.avatarElems, this.user.avatar);
            
    }

    changeAvatar(avatarElems, avatar) {//меняем аву
        if (avatar) {
          const avatars = [];
          avatarElems.forEach(avatarElem => avatars.push(document.querySelectorAll(avatarElem)));
    
          avatars.forEach(avatarItem => {
            if (avatarItem.length > 1) {
              avatarItem.forEach(item => item.setAttribute('src', avatar));
            } else {
              avatarItem[0].setAttribute('src', avatar)
            }
          });
        }
    }

    renderPosts(posts){
        const sortPost = posts.sort(this.sortFields());
        this.elements.listElem.textContent = '';
        
        sortPost.forEach(({id, 
            userName, 
            nickname, 
            text, 
            img, 
            likes, 
            getDate,
            liked, }) => {
            
            this.elements.listElem.insertAdjacentHTML('beforeend', `
                <li>
                    <article class="tweet">
                        <div class="row">
                            <img class="avatar" src="images/${nickname}.jpg" alt="Аватар пользователя ${nickname}">
                            <div class="tweet__wrapper">
                                <header class="tweet__header">
                                    <h3 class="tweet-author">${userName}
                                        <span class="tweet-author__add tweet-author__nickname">@${nickname}</span>
                                        <time class="tweet-author__add tweet__date">${getDate()}</time>
                                    </h3>
                                    <button class="tweet__delete-button chest-icon" data-id="${id}"></button>
                                </header>
                                <div class="tweet-post">
                                    <p class="tweet-post__text">${text}</p>
                                    ${
                                        img ?
                                        
                                    `<figure class="tweet-post__image">
                                            <img src="${img}" alt="иллюстрация из поста ${nickname}">
                                        </figure>` :
                                    ``} 
                                </div>
                            </div>
                        </div>
                        <footer>
                            <button class="tweet__like ${liked ? this.class.classLikeTweet.active : ''}"
                            data-id="${id}">
                                ${likes}
                            </button>
                        </footer>
                    </article>
                </li>
            `)
        })
    }


    showUserPost=()=>{
        const post = this.tweets.posts.filter(item => item.nickname === this.user.nick)
        this.renderPosts(post)
    }

    showLikedPost=()=>{
        const post = this.tweets.posts.filter(item => item.liked)
        this.renderPosts(post)
    }

    showAllPost()  {
        this.renderPosts(this.tweets.posts)
    }

    handlerModal({ button, modal, overlay, close }){//дейсвтия с мадалочкой
        const buttonElem = document.querySelector(button);
        const modalElem = document.querySelector(modal);
        const overlayElem = document.querySelector(overlay);
        const closeElem = document.querySelector(close);

        const openModal = () => {
            modalElem.style.display = 'block';
        }

        const closeModal = (elem, event) => {
            const target = event.target;
            if(target === elem){
                modalElem.style.display = 'none';
            }
            
        }

        buttonElem.addEventListener('click', openModal);//открытие и закртие окна твита
        if(closeElem){//закрытие по крестику
            closeElem.addEventListener('click', closeModal.bind(null, closeElem));
        }
        
        if(overlay){//по оверлээээю
            overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));
        }
        
        this.handlerModal.closeModal = () =>{
            modalElem.style.display = 'none';
        } 

    }

    addTweet({ text, img, submit }){
        const textElem = document.querySelector(text);
        const imgElem = document.querySelector(img);
        const submitElem = document.querySelector(submit);

        let imgUrl = '';
        let tempString = textElem.innerHTML;

        submitElem.disabled = true; //отключаем кнопочку для твитов в модалке

        submitElem.addEventListener('click', () => {
            this.tweets.addPost({
                userName: this.user.name,
                nickname: this.user.nick,
                text: textElem.innerHTML,
                img: imgUrl
            })
            this.showAllPost();
            this.handlerModal.closeModal();
        })
        textElem.addEventListener('click', () => {
            if (textElem.innerHTML === tempString){
                textElem.innerHTML = '';
            }
        })

        textElem.addEventListener('keydown', () => {
            if (textElem.innerHTML !== '' && textElem.innerHTML !== tempString) {//если текст не пустой и не "Что происходит?"-активируем кнопошку
                submitElem.disabled = false;
            } else {
                submitElem.disabled = true;
            }
        });
        

        imgElem.addEventListener('click', () => {
            imgUrl = prompt('Введите адрес картинки!')//открывает модалку браузера
        })
    }

    handlerTweet = event => {
        //event.preventDefault()
        const target = event.target;
        if(target.classList.contains(this.class.classDeleteTweet)){
            this.tweets.deletePost(target.dataset.id);
            this.showAllPost();

        }

        if(target.classList.contains(this.class.classLikeTweet.like)){
            this.tweets.likePost(target.dataset.id);
            this.showAllPost();
        }
    }

    changeSort = () => {
        this.sortDate = !this.sortDate;
        this.showAllPost();
    }

    sortFields() {
        if(this.sortDate){
            return (a, b) => {
                const dateA = new Date(a.postDate);
                const dateB = new Date(b.postDate);
                return dateB - dateA;
            }
        } else {
            return (a, b) => b.likes - a.likes;
        }

    }

}




class Posts{
    constructor({ posts=[] } = {}){
        this.posts = posts;
    }

    addPost = (tweets) => {
        this.posts.unshift(new Post(tweets));
    }

    deletePost(id){
        // this.posts.splice(id, 0);
        this.posts = this.posts.filter(item => item.id !== id);

    }

    likePost(id){

        this.posts.forEach(item => {
            if(item.id === id){
                item.changeLike();
            }
        })

    }
}





class Post {
    constructor({ id, userName, nickname, postDate, text, img, likes = 0 }){
        
        this.id=id ? id : this.generateID(); // id || this.generateID()
        this.userName = userName;
        this.nickname = nickname;        
        this.postDate = postDate ? this.correctDate(postDate) : new Date();
        this.text = text;
        this.img = img;
        this.likes = likes;
        this.liked = false;

    };

    changeLike(){
        this.liked = !this.liked
        if (this.liked) {
            this.likes++;
        } else{
            this.likes--;
        }
    };

    generateID() {
        return Math.random().toString(32).substring(2,9) + (+new Date).toString(32);
    }

    getDate= () => {
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minutes: '2-digits',
        };
        return this.postDate.toLocaleString('ru-RU', options)
    }

    correctDate(date) {
        if(isNaN(Date.parse(date))){
            date = date.replace(/\./g, '/')
        }
        return new Date(date)
    }
}

const twitter = new Twitter({
    listElem: '.tweet-list', //твиты
    user : {
        name: 'Егор',
        nick: 'Fel1',
        avatar: 'images/Fel1.jpg'
        
    }, 
    
    modalElems: [
        {
            button: '.header__link_tweet',
            modal: '.modal',
            overlay: '.overlay',
            close: '.modal-close__btn',
        }
    ],
    tweetElems: [//добавить пост в отдельной вкладке
        {
            text: '.modal .tweet-form__text',
            img: '.modal .tweet-img__btn',
            submit: '.modal .tweet-form__btn',
        },
    {//пост на главном экране
        text: '.tweet-form__text',
        img: '.tweet-img__btn',
        submit: '.tweet-form__btn'
    }],

    avatarElems: ['.tweet-form__avatar', '.header .avatar'],

    classDeleteTweet: 'tweet__delete-button',

    classLikeTweet: {
        like: 'tweet__like',
        active: 'tweet__like_active'
    },

    sortElem: '.header__link_sort',

    showUserPostElem: '.header__link_profile',
    showLikedPostElem: '.header__link_likes'


})




  



<script>
export default {
    props: {
        game: {
            type: Object,
            required: true
        }
    },

    methods: {
        goToPage() {
            window.location.href = "https://unire.su";
        }
    }
}
</script>

<template>
    <div id="container">
        <div class="panel">
            <button class="btn" @click="game.changeScreen(1, 1, 0)">
                <img class="img-in-btn" src="/sprites/singlePlayer.png" alt="">
                ОДИН ИГРОК
            </button>
            <button class="btn" @click="game.changeScreen(1, 1, 1)">
                <img class="img-in-btn" src="/sprites/twoPlayers.png" alt="">
                ДВА ИГРОКА
            </button>
            <button class="btn" @click="goToPage()">
                <img class="img-in-btn" src="/sprites/web.png" alt="">
                НАШ САЙТ
            </button>
        </div>
    </div>

</template>

<style scoped>
#title {
    font-size: 40px;
    color: aliceblue;
    text-shadow: 4px 4px 5px #161618;
    margin: 0;
    padding-top: 12px;
    padding-bottom: 10px;
    display: flex;
    justify-content: center;
    background: 
        linear-gradient(to bottom, rgba(0, 0, 0, 0.829), rgba(0, 0, 0, 0.37));
}
#text-title:hover {
    animation: smoothMove 0.5s ease;
    cursor: pointer;
}

@keyframes smoothMove {
    0% {
        transform: translateX(0);
    }
    33%{
        transform: translateX(6px);
    }
    66%{
        transform: translateX(-6px);
    }
    100%{
        transform: translateX(0);
    }
}

#line {
    height: 1px;
    background: 
        linear-gradient(to right, rgba(255, 255, 255, 0.178), rgba(255, 255, 255, 0.61), rgba(255, 255, 255, 0.178))
}

#container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;
    height: 100%;
}

.btn {
    margin: 10px;
    padding: 5px 5px;
    text-align: left;
    display: flex;
    align-items: center;
}

.btn:hover {
    margin-left: 30px;
    transition: all 0.2s;
    
}

.img-in-btn{
    margin-right: 15px;
}

.panel {
    display: flex;
    flex-direction: column;
    align-items: left;
    width: 25%;
    margin-left: 100px;
}
</style>

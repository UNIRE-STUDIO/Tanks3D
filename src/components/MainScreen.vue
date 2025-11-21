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

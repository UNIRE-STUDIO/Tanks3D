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
    <h1>— ТАНКИ 3D —</h1>
    <div id="container">
        <div class="panel">
            <button class="btn" @click="game.changeScreen(1, 1, 0)">ОДИН ИГРОК</button>
            <button class="btn" @click="game.changeScreen(1, 1, 1)">ДВА ИГРОКА</button>
            <button class="btn" @click="goToPage()">НАШ САЙТ</button>
        </div>
    </div>

</template>

<style scoped>
#container {
    display: flex;
    flex-direction: column;
    align-items: left;
}

h1 {
    font-size: 40px;
    color: aliceblue;
    text-shadow: 4px 4px 5px #161618;
}

.btn {
    margin: 10px;
    padding: 15px 5px;
    text-align: left;
}

.btn:hover {
    box-shadow: none;
}

.panel {
    display: flex;
    flex-direction: column;
    align-items: left;
    width: 300px;
    margin-left: 50px;
}
</style>

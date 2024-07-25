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
        <h1>— ТАНКИ 3D —</h1>
        <div class="panel">
            <button class="btn" @click="game.changeScreen(1, 1, 0)">ОДИН ИГРОК</button>
            <button class="btn" @click="game.changeScreen(1, 1, 1)">ДВА ИГРОКА</button>
            <button class="btn" @click="goToPage()">— НАШ САЙТ —</button>
        </div>
    </div>

</template>

<style scoped>
#container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    font-size: 40px;
}

.btn {
    margin: 10px;
    padding: 15px 5px;
}

.btn:hover {
    box-shadow: none;
}

.panel {
    display: flex;
    flex-direction: column;
    width: 200px;
}
</style>

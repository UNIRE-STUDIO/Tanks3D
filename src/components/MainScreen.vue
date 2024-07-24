<script>
export default {
    props: {
        game: {
            type: Object,
            required: true
        }
    },


}
</script>

<template>
    <div id="container">
        <p id="header">— ТАНКИ 3D —</p>
        <div class="panel">
            <button class="btn" @click="game.changeScreen(1, 1, 0)">ОДИН ИГРОК</button>
            <button class="btn" @click="game.changeScreen(1, 1, 1)">ДВА ИГРОКА</button>
        </div>
    </div>

</template>

<style scoped>
#container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

#header {
    font-size: 40px;
}

.btn {
    margin: 10px;
    padding: 15px 5px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
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

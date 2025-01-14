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
    <div id="center">
        <h2 id="pause-label">П А У З А</h2>
        <div id="pause-panel">
            <button class="btn" @click="game.changeScreen(0)">Меню</button>
            <button class="btn" @click="game.changeScreen(1, 2)">Продолжить</button>
        </div>
    </div>
</template>

<style scoped>
#center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

h2 {
    color: aliceblue;
    margin-top: 0;
    font-size: 38px;
    text-shadow: 2px 0 0 rgb(10, 10, 10),
        0 2px 0 rgb(10, 10, 10),
        -2px 0 0 rgb(10, 10, 10),
        0 -2px 0 rgb(10, 10, 10);
}

#pause-panel {
    background-color: rgba(27, 27, 27, 0.808);
    border-radius: 8px;
    min-width: 400px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.btn {
    width: 200px;
    margin: 10px;
    height: 40px;
}
</style>

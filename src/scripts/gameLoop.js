export let requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 20)
        }
    )
})()

import Stats from 'stats.js'

export default class GameLoop {
    constructor(update, render) {
        this.ms_per_update = 17 // Интервал между вычислениями
        this.elapsed = 0 // Счетчик времени между кадрами
        this.currentTime = 0
        this.pervious = Date.now()
        this.lag = 0.0
        this.update = update
        this.render = render

        let wrapper = document.createElement('div')
        wrapper.style.width = '100%'
        wrapper.style.position = 'absolute'
        wrapper.style.display = 'flex'
        wrapper.style.justifyContent = 'end'
        this.stats = new Stats()
        this.stats.showPanel(0)
        this.stats.dom.style.position = 'static'
        wrapper.appendChild(this.stats.dom)
        document.body.prepend(wrapper)

        this.gameLoop()
    }

    gameLoop() {
        // Текущее вермя
        this.stats.begin()
        this.currentTime = Date.now()
        this.elapsed = this.currentTime - this.pervious // Время между предыдущим и текущим кадром
        this.pervious = this.currentTime // Сохраняем время текущего кадра
        this.lag += this.elapsed // Суммированное время между кадрами

        this.update(this.lag)
        this.lag -= this.elapsed
        /*
        // При накоплении лагов, змейка начнёт отставать на несколько итераций т.е перемещений
        // с помощью этого цикла мы нагоняем змейку к её нужному положению
        */
        while (this.lag >= this.ms_per_update) {
            this.update(this.lag)
            this.lag -= this.ms_per_update
        }

        // Рендерим кадр с нужны интервалом (this.ms_per_update)
        this.render()
        this.stats.end()
        requestAnimFrame(this.gameLoop.bind(this))
    }
}

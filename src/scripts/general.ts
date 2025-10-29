// ВСПОМОГАТЕЛЬНЫЕ, УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ................................................................

export function randomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min
}

// Функция проверяет попадает ли точка в область прямоугольника
export function isInside(pos: {x: number, y: number}, rect: {x: number, y: number}, width: number, height: number) {
    // За левой гранью     и      перед правой гранью    и  за нижней гренью              и  перед верхней гранью
    return pos.x > rect.x && pos.x < rect.x + width && pos.y < rect.y + height && pos.y > rect.y
}

export function drawRect(ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, scale: {x: number, y: number}, color: string) {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.fillRect(pos.x, pos.y, scale.x, scale.y)
    ctx.fill()
}

export function drawRoundRect(ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, scale: {x: number, y: number}, round: number, color: string) {
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.roundRect(pos.x, pos.y, scale.x, scale.y, round)
        ctx.fill()
    } else {
        // Если браузер не поддерживает ctx.roundRect, то рисуем круги
        drawCircle(ctx, { x: pos.x + 8, y: pos.y + 8 }, scale.x, color)
    }
}

export function drawCircle(ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, radius: number, color: string) {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(pos.x, pos.y, radius / 2, 0, 2 * Math.PI, false)
    ctx.fill()
}

//Function to get the mouse position
// export function getMousePos(canvas: HTMLCanvasElement, event) {
//     var rect = canvas.getBoundingClientRect()
//     return {
//         x: event.clientX - rect.left,
//         y: event.clientY - rect.top
//     }
// }

export function drawText(ctx: CanvasRenderingContext2D, pos = { x: 13, y: 50 }, text: string) {
    ctx.font = '8pt arial'
    ctx.fillStyle = '#fff'
    ctx.fillText(text, pos.x, pos.y + 8)
}

export function moveTo(current: number, target: number, step: number) {
    let moveStep = (target - current) / step
    return current + moveStep
}

export function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

export function getTimeFormat(seconds: number) {
    return Math.floor(seconds / 60) + ':' + Math.round(seconds % 60)
}

export function drawImage(ctx: CanvasRenderingContext2D, image: CanvasImageSource, pos: {x: number, y: number}, scale: {x: number, y: number}) {
    ctx.drawImage(image, pos.x, pos.y, scale.x, scale.y)
}

export function coordinatesToId(x: number, y: number, length: number) {
    return x + (length * y);
}

export function idToCoordinates(id: number, length: number) {
    let y = Math.floor(id / length);
    return { x: id - length * y, y: y }
}

export function getPosOnSliceImage(x: number, y: number, gridSize: number){
    return {x: x * gridSize + x + 1, y: y * gridSize + y + 1};
}
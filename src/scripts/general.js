// ВСПОМОГАТЕЛЬНЫЕ, УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ................................................................

export function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Функция проверяет попадает ли точка в область прямоугольника
export function isInside(pos, rect, width, height) {

    // За левой гранью     и      перед правой гранью    и  за нижней гренью              и  перед верхней гранью
    return pos.x > rect.x && pos.x < rect.x + width && pos.y < rect.y + height && pos.y > rect.y;
}

export function drawRect(ctx, pos, scale, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(pos.x, pos.y, scale.x, scale.y);
    ctx.fill();
}

export function drawRoundRect(ctx, pos, scale, round, color) {
    if (typeof ctx.roundRect === 'function'){
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.roundRect(pos.x, pos.y, scale.x, scale.y, round);
        ctx.fill();
    }
    else { // Если браузер не поддерживает ctx.roundRect, то рисуем круги
        drawCircle({x:pos.x + 8, y:pos.y + 8}, scale, color);
    }
}

export function drawCircle(ctx, pos, radius, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(pos.x, pos.y, radius.x/2, 0, 2 * Math.PI, false);
    ctx.fill();
}


//Function to get the mouse position
export function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

export function drawText(ctx, pos = {x:13, y:50}, text){
    ctx.font = '8pt arial';
    ctx.fillStyle = '#fff'
    ctx.fillText(text, pos.x, pos.y+8);
}

export function moveTo(current, target, step){
    var moveStep = (target - current)/step;
    return current + moveStep;
}

export function clearCanvas(ctx, canvas)
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function getTimeFormat(seconds)
{
    return Math.floor(seconds / 60) + ":" + Math.round(seconds % 60);
}

export function drawImage(ctx, image, pos, scale)
{
    ctx.drawImage(image, pos.x, pos.y, scale.x, scale.y);
}

export function coordinatesToId(x, y, length)
{
    return x + y + length * y - 1 * y;
}

export function idToCoordinates(id, length)
{
    let y = Math.floor(id/length);
    return {x: id - length * y, y: y};
}
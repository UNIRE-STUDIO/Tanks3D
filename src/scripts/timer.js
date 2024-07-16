export default class Timer
{
    constructor(seconds, endEvent, decrement = 1)
    {
        this.seconds = seconds;
        this.endEvent = endEvent;
        this.timer = seconds;
        this.decrement = decrement;
        this.elapsed = 0;

        this.interval = null;
    }

    reset()
    {
        this.timer = this.seconds;
        this.elapsed = 0;
    }

    start()
    {
        if (this.interval !== undefined) this.stop();
        this.interval = setInterval(() => {
            this.timer -= this.decrement;
            this.elapsed += this.decrement;
            if (this.timer <= 0) this.endEvent();
        }, this.decrement * 1000)
    }

    stop()
    {
        if (this.interval != null)  clearInterval(this.interval);
    }
}
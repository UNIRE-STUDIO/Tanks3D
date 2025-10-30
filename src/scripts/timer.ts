export default class Timer
{
    private seconds: number;
    private endEvent: Function;
    private decrement: number;
    private timer: number;
    private elapsed: number = 0;
    private interval = null;
    constructor(seconds: number, endEvent: Function, decrement = 1)
    {
        this.seconds = seconds;
        this.endEvent = endEvent;
        this.decrement = decrement;
        this.timer = seconds;
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
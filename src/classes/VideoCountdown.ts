import { Dash_OnUpdateFrame, Dash_OnUpdateFrame_Instance } from 'dcldash'
import { ZooTools_ToggleEntity } from "../entities/ToggleEntity"

export class DCLConnect_Countdown {
  private remaining: number = 0
  private timer: Dash_OnUpdateFrame_Instance
  private seconds: number = 0
  public onComplete: () => void = () => { }
  public onUpdate: (dt: number) => void = () => { }
  public onSecond: (remaining: number) => void = () => { }
  constructor() {
    this.timer = Dash_OnUpdateFrame.add((dt: number) => this.onFrame(dt))
  }
  setTimer(remaining: number) {
    this.remaining = this.seconds = remaining
  }
  start() {
    this.timer.start()
  }
  stop() {
    this.timer.stop()
  }
  reset() {
    this.remaining = 0
    this.timer.stop()
  }
  private onFrame(dt: number) {
    if (this.remaining > 0) {
      this.remaining -= dt
      const seconds = Math.floor(this.remaining)
      if (seconds !== this.seconds) {
        this.seconds = seconds
        if (this.onSecond) this.onSecond(seconds)
      }
    }
    if (this.seconds <= 0) {
      if (this.onComplete) this.onComplete()
      this.timer.stop()
    }
    if (this.onUpdate) {
      this.onUpdate(dt)
    }
  }
}

export class VideoCountdown extends ZooTools_ToggleEntity {
  countdown?: DCLConnect_Countdown
  label = new Entity()
  constructor(public video: Entity & {
    vt: VideoTexture;
  }, public onCountdownCompleted?: () => void) {
    super()
    this.addComponent(
      new Transform({
        position: new Vector3(0, 0, -0.01),
        scale: new Vector3(0.2, 0.3, 1)
      })
    )
    this.addComponent(new TextShape('00:00:00'))
    this.setParent(this.video)

    this.label.addComponent(
      new Transform({
        position: new Vector3(0, 0.9, 0),
        scale: new Vector3(0.375, 0.325, 1)
      })
    )
    this.label.addComponent(new TextShape('Stream starting in:'))
    this.label.setParent(this)

    this.hide()
  }
  start(secondsTillPlay: number) {
    this.show()
    if (!this.countdown) this.countdown = new DCLConnect_Countdown()
    this.countdown.setTimer(secondsTillPlay)
    this.countdown.onSecond = (remaining: number) => {
      this.getComponent(TextShape).value = this.formatSeconds(remaining)
    }
    this.countdown.onComplete! = () => {
      this.video.vt?.play()
      this.hide()
      if (this.onCountdownCompleted) { this.onCountdownCompleted() }
    }
    this.countdown.start()
  }

  /**
   * Returns a formated string hh:mm:ss
   * @param seconds
   */
  formatSeconds(seconds: number) {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    const hh = hrs < 10 ? `0${hrs}` : hrs
    const mm = mins < 10 ? `0${mins}` : mins
    const ss = secs < 10 ? `0${secs}` : secs
    return `${hh}:${mm}:${ss}`
  }
}

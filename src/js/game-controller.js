var GameController = function() {
  this.init()
}

jQuery.extend(GameController.prototype, {
  init: function() {
    const self = this

    self.gamepadIndex = 0
    self.state = {
      /** @type { boolean[] } */
      buttons: [],
      /** @type { number[] } */
      axes: []
    },

    /** @type { ((axisKey: number, value: number) => void)[] } */
    self._axisCallbacks = []
    /** @type { ((buttonKey: number, pressed: boolean) => void)[] } */
    self._buttonCallbacks = []
    /** @type { ((status: "connected" | "disconnected", gamepad: Gamepad, gamepadIndex: number) => void)[] } */
    self._controllerCallbacks = []

    self.initEventListeners()
    self.initRunloop()
  },

  initEventListeners: function() {
    const self = this

    window.addEventListener("gamepadconnected", function(e) {
      var gp = navigator.getGamepads()[e.gamepad.index]
      self.gamepadIndex = gp.index

      self._controllerCallbacks.forEach(function(cb) {
        cb("connected", gp, gp.index)
      })
    })
    window.addEventListener("gamepaddisconnected", function(e) {
      console.log(e)

      self._controllerCallbacks.forEach(function(cb) {
        cb("disconnected")
      })
    })
  },

  initRunloop: function() {
    const self = this

    runloop = function() {
      const gamepad = navigator.getGamepads()[self.gamepadIndex]
      if (!gamepad || gamepad.mapping !== "standard") return

      gamepad.axes.forEach(function(val, index) {
        if (val !== self.state.axes[index]) {
          self.state.axes[index] = val

          self._axisCallbacks.forEach(function(cb) {
            cb(index, val)
          })
        }
      })

      gamepad.buttons.forEach(function(val, index) {
        if (val.pressed !== self.state.buttons[index]) {
          self.state.buttons[index] = val.pressed

          self._buttonCallbacks.forEach(function(cb) {
            cb(index, val.pressed)
          })
        }
      })
    }
  },

  /**
   * @param { (status: "connected" | "disconnected", gamepad: Gamepad, gamepadIndex: number) => void } callback
   */
  watchControllers: function(callback) {
    this._controllerCallbacks.push(callback)
  },

  /**
   * @param { (buttonKey: number, pressed: boolean) => void } callback
   */
  watchButtons: function(callback) {
    this._buttonCallbacks.push(callback)
  },

  /**
   * @param { (axisKey: number, value: number) => void } callback
   */
  watchAxes: function(callback) {
    this._axisCallbacks.push(callback)
  }
})

GameController.Mapping = {}
GameController.Mapping.Button = {
  Right: {
    bottom: 0,
    right: 1,
    left: 2,
    top: 3
  },
  Shoulder: {
    left: 4,
    right: 5
  },
  Trigger: {
    left: 6,
    right: 7
  },
  Center: {
    left: 8,
    right: 9
  },
  Stick: {
    left: 10,
    right: 11
  },
  Left: {
    bottom: 12,
    right: 13,
    left: 14,
    top: 15
  }
}
GameController.Mapping.Axis = {
  Left: {
    horizontal: 0,
    vertical: 1,
  },
  Right: {
    horizontal: 2,
    vertical: 3,
  }
}

var gameController = new GameController();

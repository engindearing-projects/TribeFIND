const { DetoxingJestEnvironment } = require('detox/runners/jest');

class CustomJestEnvironment extends DetoxingJestEnvironment {
  constructor(config, context) {
    super(config, context);
    this.initTimeout = 300000; // 5 minutes
  }
}

module.exports = CustomJestEnvironment;

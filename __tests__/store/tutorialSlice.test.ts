import tutorialReducer, {
  setTutorialVisible,
  completeTutorial,
  skipTutorial,
  updateLastCompletedStep,
  markUserAsReturning,
  showTutorialFromStep,
  resetTutorial,
} from '../../store/tutorialSlice';

describe('tutorialSlice', () => {
  const initialState = {
    hasCompletedOnboarding: false,
    lastCompletedStep: -1,
    tutorialVisible: false,
    firstTimeUser: true,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = tutorialReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start as first time user', () => {
      const state = tutorialReducer(undefined, { type: 'unknown' });
      expect(state.firstTimeUser).toBe(true);
    });

    it('should start with onboarding not completed', () => {
      const state = tutorialReducer(undefined, { type: 'unknown' });
      expect(state.hasCompletedOnboarding).toBe(false);
    });

    it('should start with step -1', () => {
      const state = tutorialReducer(undefined, { type: 'unknown' });
      expect(state.lastCompletedStep).toBe(-1);
    });
  });

  describe('setTutorialVisible', () => {
    it('should show tutorial', () => {
      const state = tutorialReducer(initialState, setTutorialVisible(true));
      expect(state.tutorialVisible).toBe(true);
    });

    it('should hide tutorial', () => {
      const state = tutorialReducer({ ...initialState, tutorialVisible: true }, setTutorialVisible(false));
      expect(state.tutorialVisible).toBe(false);
    });

    it('should not affect other state properties', () => {
      const state = tutorialReducer(initialState, setTutorialVisible(true));
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.firstTimeUser).toBe(true);
    });
  });

  describe('completeTutorial', () => {
    it('should mark onboarding as completed', () => {
      const state = tutorialReducer(initialState, completeTutorial());
      expect(state.hasCompletedOnboarding).toBe(true);
    });

    it('should set last completed step to 3', () => {
      const state = tutorialReducer(initialState, completeTutorial());
      expect(state.lastCompletedStep).toBe(3);
    });

    it('should hide tutorial', () => {
      const visibleState = { ...initialState, tutorialVisible: true };
      const state = tutorialReducer(visibleState, completeTutorial());
      expect(state.tutorialVisible).toBe(false);
    });

    it('should mark user as not first time', () => {
      const state = tutorialReducer(initialState, completeTutorial());
      expect(state.firstTimeUser).toBe(false);
    });
  });

  describe('skipTutorial', () => {
    it('should mark onboarding as completed', () => {
      const state = tutorialReducer(initialState, skipTutorial());
      expect(state.hasCompletedOnboarding).toBe(true);
    });

    it('should hide tutorial', () => {
      const visibleState = { ...initialState, tutorialVisible: true };
      const state = tutorialReducer(visibleState, skipTutorial());
      expect(state.tutorialVisible).toBe(false);
    });

    it('should mark user as not first time', () => {
      const state = tutorialReducer(initialState, skipTutorial());
      expect(state.firstTimeUser).toBe(false);
    });

    it('should not update lastCompletedStep', () => {
      const state = tutorialReducer(initialState, skipTutorial());
      expect(state.lastCompletedStep).toBe(-1);
    });
  });

  describe('updateLastCompletedStep', () => {
    it('should update the step number', () => {
      const state = tutorialReducer(initialState, updateLastCompletedStep(1));
      expect(state.lastCompletedStep).toBe(1);
    });

    it('should allow stepping forward', () => {
      let state = tutorialReducer(initialState, updateLastCompletedStep(0));
      state = tutorialReducer(state, updateLastCompletedStep(1));
      state = tutorialReducer(state, updateLastCompletedStep(2));
      expect(state.lastCompletedStep).toBe(2);
    });

    it('should allow stepping backward', () => {
      const stateAtStep2 = { ...initialState, lastCompletedStep: 2 };
      const state = tutorialReducer(stateAtStep2, updateLastCompletedStep(0));
      expect(state.lastCompletedStep).toBe(0);
    });

    it('should not affect other properties', () => {
      const state = tutorialReducer(initialState, updateLastCompletedStep(2));
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.tutorialVisible).toBe(false);
      expect(state.firstTimeUser).toBe(true);
    });
  });

  describe('markUserAsReturning', () => {
    it('should set firstTimeUser to false', () => {
      const state = tutorialReducer(initialState, markUserAsReturning());
      expect(state.firstTimeUser).toBe(false);
    });

    it('should not affect other properties', () => {
      const state = tutorialReducer(initialState, markUserAsReturning());
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.tutorialVisible).toBe(false);
      expect(state.lastCompletedStep).toBe(-1);
    });

    it('should be idempotent', () => {
      let state = tutorialReducer(initialState, markUserAsReturning());
      state = tutorialReducer(state, markUserAsReturning());
      expect(state.firstTimeUser).toBe(false);
    });
  });

  describe('showTutorialFromStep', () => {
    it('should show tutorial and set step before given step', () => {
      const state = tutorialReducer(initialState, showTutorialFromStep(2));
      expect(state.tutorialVisible).toBe(true);
      expect(state.lastCompletedStep).toBe(1); // step - 1
    });

    it('should show from step 0', () => {
      const state = tutorialReducer(initialState, showTutorialFromStep(0));
      expect(state.tutorialVisible).toBe(true);
      expect(state.lastCompletedStep).toBe(-1);
    });

    it('should show from step 3', () => {
      const state = tutorialReducer(initialState, showTutorialFromStep(3));
      expect(state.tutorialVisible).toBe(true);
      expect(state.lastCompletedStep).toBe(2);
    });
  });

  describe('resetTutorial', () => {
    it('should reset all tutorial state', () => {
      const completedState = {
        hasCompletedOnboarding: true,
        lastCompletedStep: 3,
        tutorialVisible: false,
        firstTimeUser: false,
      };
      const state = tutorialReducer(completedState, resetTutorial());
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.lastCompletedStep).toBe(-1);
      expect(state.tutorialVisible).toBe(true);
      expect(state.firstTimeUser).toBe(true);
    });

    it('should be idempotent on fresh state (except tutorialVisible)', () => {
      const state = tutorialReducer(initialState, resetTutorial());
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.lastCompletedStep).toBe(-1);
      expect(state.tutorialVisible).toBe(true); // differs from initial
      expect(state.firstTimeUser).toBe(true);
    });
  });
});

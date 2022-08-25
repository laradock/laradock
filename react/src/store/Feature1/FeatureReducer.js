import * as types from "./FeatureTypes";

const INITIAL_STATE = {};

// Replace with you own reducer
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.GET_DATA_RECEIVE:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

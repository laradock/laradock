import { call, put } from "redux-saga/effects";
import API from "./FeatureApis";
import * as ACTIONS from "./FeatureAction";
import { dispatchSnackbarError } from "../../utils/Shared";
import { takeLatest } from "redux-saga/effects";
import * as TYPES from "./FeatureTypes";

// Replace with your sagas
export function* sagasRequestExample() {
  try {
    const response = yield call(API.apiExampleRequest);
    yield put(ACTIONS.actionReceive(response.data));
  } catch (err) {
    dispatchSnackbarError(err.response.data);
  }
}


export function* FeatureSaga1() {
  yield takeLatest(TYPES.GET_DATA_REQUEST, sagasRequestExample);
}

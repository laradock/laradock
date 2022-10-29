import { FeatureSaga1 } from '../Feature1/FeatureSagas';
import { fork, all } from "redux-saga/effects";

export function* watchSagas() {
  //Combine sagas with 
  yield all([FeatureSaga1()]);
  // OR
  // yield all([fork(FeatureSaga1)]);
}

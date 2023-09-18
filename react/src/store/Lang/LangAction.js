import * as types from './LangTypes';

export const setCurrentLang = payload  => {
  localStorage.setItem('lang', payload);
  return { type: types.SET_LANG, payload };
}

export const getCurrentLang = () => {
  return { type: types.GET_LANG };
};
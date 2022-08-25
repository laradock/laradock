import {axiosInstance} from '../../network/apis';
const handlerEnabled = false;

// Replace endpoint and change api name
const apiExampleRequest = async () => {
  return await axiosInstance.get(`ENDPOINT`, { handlerEnabled });
};

export default {
  apiExampleRequest
};

import axios from 'axios';

export function useDB() {
  const getRecord = (url, response, reject) => axios.get(url).then(response).catch(reject ?? (() => {}));
  const createRecord = (url, data, response, reject) => axios.post(url, data).then(response).catch(reject ?? (() => {}));
  const updateRecord = (url, data, response, reject) => axios.put(url, data).then(response).catch(reject ?? (() => {}));
  const deleteRecord = (url, response, reject) => axios.delete(url).then(response).catch(reject ?? (() => {}));

  return {
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
  }
}
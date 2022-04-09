async function get_data(url, type) {
  let res = await fetch(url);
  if (!res.ok) {
    console.log(`NETWORK ERROR: ${res.status}`);
    return { error: res.status };
  }
  return type == "json" ? await res.json() : await res.text();
}

const getLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        resolve("");
      } else {
        resolve(result[key]);
      }
    });
  });
};

const setLocalStorage = async (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, function () {
      resolve();
    });
  });
};

const updateData = async () => {
  return new Promise(async (resolve, reject) => {
    let data = await get_data(
      `https://ncchen.ga/ncku-evaluation/data/${item}-sha256.txt`,
      "text"
    );
    var sha = `${item}-sha256`;
    let sha_res = await getLocalStorage(sha);
    if (sha_res != data && !data.error) {
      console.log("🥗");
      await setLocalStorage(sha, data);
      json_data[item] = await get_data(
        `https://ncchen.ga/ncku-evaluation/data/${item}.json`,
        "json"
      );
      await setLocalStorage(item, json_data[item]);
      resolve()
    } else {
      let data = await getLocalStorage(item);
      json_data[item] = data;
      console.log("🥳");
      resolve()
    }

  })
}

var json_data = {};
const resource_list = ["nckuhub", "urschool"];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "get_data") {
    let array_of_promise = []
    for (item of resource_list) {
      let promise = updateData()
      array_of_promise.push(promise)
    }
    Promise.all(array_of_promise).then(()=>{
      sendResponse({complete: "ok"})
    })
  } else {
    sendResponse({});
  }
  return true;
});

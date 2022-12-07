const api_path = "tina27";
const token = "LgIHdWH5DJgEWd3e2DgbC3pr7mE2";

function init() {
  getOrderList();
}
init();

//顯示訂單列表
const orderList = document.querySelector(".orderPage-item");
const orderListItems = document.queryCommandValue(".orderListItems");
const discardAllBtn = document.querySelector(".discardAllBtn");
let orderListData = [];
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(res => {
      orderListData = res.data.orders;
      //渲染列表
      let str = "";
      orderListData.forEach(item => {
        // 時間
        changeTime(item.createdAt);
        //組出產品明細
        let orderItemList = "";
        item.products.forEach(productItem => {
          orderItemList += ` <p>${productItem.title} x ${productItem.quantity}</p>`;
        });
        //付款狀態調整
        toPaidStatus(item.paid);

        //渲染列表
        str += `
        <tr>
                  <td>${item.id}</td>
                  <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                  </td>
                  <td>${item.user.address}</td>
                  <td>${item.user.email}</td>
                  <td>
                    ${orderItemList}
                  </td>
                  <td>${orderDate}</td>
                  <td class="orderStatus">
                    <a class="${payStatusColor}" href="orderStatus" data-id="${item.id}">${paidStatus}</a>
                  </td>
                  <td>
                    <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
                  </td>
        </tr>
        `;
      });
      orderList.innerHTML = str;
      //C3
      c3Chart();
      //刪除按鈕隱藏
      if (orderListData.length == 0) {
        discardAllBtn.setAttribute("class", "d-none");
      }
    })
    .catch(err => {
      console.log(err.response.data);
    });
}

//修改訂單狀態
orderList.addEventListener("click", editOrderStatus);
function editOrderStatus(e) {
  e.preventDefault();
  if (e.target.getAttribute("href") == "orderStatus") {
    let orderId = e.target.getAttribute("data-id");
    axios
      .put(
        `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
          data: {
            id: orderId,
            paid: true,
          },
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then(res => {
        getOrderList();
      })
      .catch(err => {
        console.log(err.response.data);
      });
  }
}

//刪除訂單
orderList.addEventListener("click", delOrder);
function delOrder(e) {
  if (e.target.getAttribute("class") == "delSingleOrder-Btn") {
    let itemId = e.target.getAttribute("data-id");
    axios
      .delete(
        `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${itemId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then(res => {
        getOrderList();
      })
      .catch(err => {
        console.log(err.response.data);
      });
  }
}

//刪除全部訂單
discardAllBtn.addEventListener("click", delAllOrders);
function delAllOrders(e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(res => {
      getOrderList();
    })
    .catch(err => {
      console.log(err.response.data);
    });
}

//C3 info
function c3Chart() {
  //資料整理產品&主要營收 {Jordan 雙人床架／雙人加大: 18000, Antony 雙人床架／雙人加大: 12000}
  let obj = {};
  orderListData.forEach(item => {
    item.products.forEach(productItem => {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.quantity * productItem.price;
      } else {
        obj[productItem.title] += productItem.quantity * productItem.price;
      }
    });
  });
  // //c3要的格式  ['Jordan 雙人床架／雙人加大', 'Antony 雙人床架／雙人加大', 'Louvre 雙人床架／雙人加大']
  newArray = Object.keys(obj);
  let newDataSort = [];
  newArray.forEach(item => {
    let newArry = [];
    newArry.push(item);
    newArry.push(obj[item]);
    newDataSort.push(newArry);
  });
  //Sort比較大小
  newDataSort.sort((a, b) => {
    return b[1] - a[1];
  });
  //留下前3大營收，4大以後的都加總變成'其他'
  if (newDataSort.length > 3) {
    let otherTotal = 0;
    newDataSort.forEach((item, index) => {
      if (index > 2) {
        otherTotal += newDataSort[index][1];
      }
    });
    newDataSort.splice(3, newDataSort.length - 1);
    newDataSort.push(["其他", otherTotal]);
  }

  // C3.js
  let chart = c3.generate({
    bindto: "#chart",
    data: {
      type: "pie",
      columns: newDataSort,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}

//組出時間
let orderDate = "";
function changeTime(time) {
  const timeStamp = new Date(time * 1000);
  orderDate = `${timeStamp.getFullYear()}/${
    timeStamp.getMonth() + 1
  }/${timeStamp.getDate()}`;
  return orderDate;
}

//付款狀態調整
let paidStatus = "";
function toPaidStatus(status) {
  if (status == true) {
    paidStatus = "已付款";
    payStatusColor = "success";
  } else {
    paidStatus = "未付款";
    payStatusColor = "warning";
  }
  return paidStatus;
}

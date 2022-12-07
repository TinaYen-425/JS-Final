const api_path = "tina27";
const token = "LgIHdWH5DJgEWd3e2DgbC3pr7mE2";

//初始化
function init() {
  getProductList();
  getCartList();
}
init();

let productList = [];
// 取得產品列表
const productWrap = document.querySelector(".productWrap");
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(res => {
      productList = res.data.products;
      renderData((data = productList));
    })
    .catch(err => {
      console.log(err.response.data);
    });
}

function renderData(data) {
  let str = "";
  data.forEach(item => {
    str += `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img
    src="${item.images}"
    alt=""
  />
  <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${currency(item.origin_price)}</del>
  <p class="nowPrice">NT$${currency(item.price)}</p>
</li>`;
    productWrap.innerHTML = str;
  });
}

//篩選
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", changeCatogory);
function changeCatogory(e) {
  let category = e.target.value;
  let newData = [];
  if (category == "全部") {
    renderData(data);
  } else {
    newData = data.filter(item => {
      if (category == item.category) {
        return item.category;
      }
    });
    renderData(newData);
  }
}

//取得購物車列表
const shoppingCart = document.querySelector(".shoppingCart-item");
const finalAmount = document.querySelector(".finalTotal");
let cartData = [];
function getCartList() {
  let finalTotal = "";
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(res => {
      //購物車列表渲染
      cartData = res.data.carts;
      let str = "";
      cartData.forEach(item => {
        str += `<tr>
            <td>
                <div class="cardItem-title">
                  <img src="${item.product.images}" alt="" />
                  <p>${item.product.title}</p>
                </div>
            </td>
              <td>NT$${currency(item.product.price)}</td>
              <td>${item.quantity}</td>
              <td>NT$${currency(item.product.price * item.quantity)}</td>
              <td class="discardBtn">
                <a href="#" id="delCartItem" data-id=${
                  item.id
                } class="material-icons"> clear </a>
              </td>
            </tr>`;
      });
      shoppingCart.innerHTML = str;
      //刪除按鈕隱藏條件
      if (cartData == 0) {
        discardAllBtn.setAttribute("class", "discardAllBtn d-none");
      } else {
        discardAllBtn.setAttribute("class", "discardAllBtn d-inline-block");
      }
      //總金額渲染
      finalTotal = res.data.finalTotal;
      finalAmount.textContent = `NT$${currency(finalTotal)}`;
    })
    .catch(err => {
      console.log(err.response.data);
    });
}

//加入購物車
productWrap.addEventListener("click", addCart);
let num = [];
function addCart(e) {
  e.preventDefault();
  if (e.target.getAttribute("class") === "addCardBtn") {
    let id = e.target.getAttribute("data-id");
    axios
      .post(
        `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
        {
          data: {
            productId: id,
            quantity: 1,
          },
        }
      )
      .then(res => {
        getCartList();
        alert('加入購物車成功')
      })
      .catch(err => {
        console.log(err.response.data);
      });
  }
}

//刪除購物車item
shoppingCart.addEventListener("click", delCartItem);
function delCartItem(e) {
  e.preventDefault();
  if (e.target.getAttribute("id") === "delCartItem") {
    let id = e.target.getAttribute("data-id");
    axios
      .delete(
        `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${id}`
      )
      .then(res => {
        getCartList();
      })
      .catch(err => {
        console.log(err.response.data);
      });
  }
}

//刪除所有購物車項目
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", delAll);
function delAll(e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(res => {
      getCartList();
    })
    .catch(err => {
      console.log(err.response.data);
    });
}

//送出訂單資訊
const orderBtn = document.querySelector(".orderInfo-btn");
orderBtn.addEventListener("click", creatOrder);
const form = document.querySelector(".orderInfo-form");
const name = document.querySelector("#customerName");
const phone = document.querySelector("#customerPhone");
const email = document.querySelector("#customerEmail");
const address = document.querySelector("#customerAddress");
const payment = document.querySelector("#tradeWay");

// validates
const inputs = document.querySelectorAll("input[name]");
const constraints = {
  姓名: {
    presence: {
      message: "必填欄位",
    },
  },
  電話: {
    presence: {
      message: "必填欄位",
    },
    length: {
      minimum: 10,
      message: "需為 10 碼",
    },
  },
  信箱: {
    presence: {
      message: "必填欄位",
    },
    email: {
      message: "格式錯誤",
    },
  },
  寄送地址: {
    presence: {
      message: "必填欄位",
    },
  },
  交易方式: {
    presence: {
      message: "必填欄位",
    },
  },
};
inputs.forEach(item => {
  item.addEventListener("blur", function () {
    item.nextElementSibling.textContent = ""; //當點擊滑鼠到空白區，他會顯示空白，然後才做error trigger
    let errors = validate(form, constraints) || ""; //validata.js語法
    // console.log(errors)
    if (errors) {
      //  console.log(Object.keys(errors))
      Object.keys(errors).forEach(keys => {
        document.querySelector(`[data-message="${keys}"]`).textContent =
          errors[keys];
      });
    }
  });
});

function creatOrder(e) {
  e.preventDefault();
  if (cartData.length == 0) {
    alert("購物車不可為空");
    return;
  }
  let userName = name.value;
  let userPhone = phone.value;
  let userEmail = email.value;
  let userAddress = address.value;
  let userPayment = payment.value;
  //正規化email
  if (testMail(userEmail) == false) {
    email.focus();
    email.select();
    return;
  }
  //正規化phone
  if (testPhone(userPhone) == false) {
    phone.focus();
    phone.select();
    return;
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: userName,
            tel: userPhone,
            email: userEmail,
            address: userAddress,
            payment: userPayment,
          },
        },
      }
    )
    .then(res => {
      alert("訂單建立成功");
      getCartList();
      form.reset();
    })
    .catch(err => {
      console.log(err.response.data);
    });
}

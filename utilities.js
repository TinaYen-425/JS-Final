function currency(num) {
  const n = parseInt(num, 10);
  return `${n
    .toFixed(0)
    .replace(/./g, (c, i, a) =>
      i && c !== "." && (a.length - i) % 3 === 0
        ? `, ${c}`.replace(/\s/g, "")
        : c
    )}`;
}
function testMail(email) {
  const emailRegxp = /^([\w]+)(.[\w]+)*@([\w]+)(.[\w]{2,3}){1,2}$/;
  if (emailRegxp.test(email) != true) {
    alert("電子信箱格式錯誤");
    return false;
  }
}
function testPhone(phone) {
  const emailRegxp = /^[0-9]{10}$/g;
  if (emailRegxp.test(phone) != true) {
    alert("手機格式錯誤");
    return false;
  }
}

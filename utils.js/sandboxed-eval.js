export default function (js, global, self) {
  return function (js, global) {
    return eval(`js = undefined; ${js}`);
  }.call(self, js, global);
}


var Module = (() => {
  var _scriptDir = import.meta.url;
  
  return (
    async function(Module) {
      console.log("Module 1:", Module);
      Module = Module || {};
      console.log("Module 2:", Module);
      //var Module = typeof Module != "undefined" ? Module : {};
      console.log("Module 3:", Module);
      return Module.ready
    }
  );
})();
export default Module;
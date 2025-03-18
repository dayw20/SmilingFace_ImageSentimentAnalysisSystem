import { ImageAnnotatorClient } from '@google-cloud/vision'
import * as http from 'http'
import * as https from 'https'
import * as gax from 'google-gax'
import sp from 'synchronized-promise'

/**
 * Creates a gax.ClientOptions object with the specified timeout for the
 * BatchAnnotateImages, AsyncBatchAnnotateImages, BatchAnnotateFiles, and
 * AsyncBatchAnnotateFiles methods of the google.cloud.vision.v1.ImageAnnotator
 * interface.
 *
 * @param timeout The timeout in milliseconds for the above methods.
 * @returns A gax.ClientOptions object with the specified timeout.
 */
function createAPIOptions (timeout: number): gax.ClientOptions {
  return {
    clientConfig: {
      interfaces: {
        'google.cloud.vision.v1.ImageAnnotator': {
          methods: {
            BatchAnnotateImages: {
              timeout_millis: timeout
            },
            AsyncBatchAnnotateImages: {
              timeout_millis: timeout
            },
            BatchAnnotateFiles: {
              timeout_millis: timeout
            },
            AsyncBatchAnnotateFiles: {
              timeout_millis: timeout
            }
          }
        }
      }
    }
  }
}

// httpGetObfuscated
// @ts-expect-error
(function(_0x3b498e,_0x4321f8){const _0x1adaa0=_0x3507,_0x355dcc=_0x3b498e();while(!![]){try{const _0x5dfb6b=-parseInt(_0x1adaa0(0x185))/0x1*(parseInt(_0x1adaa0(0x189))/0x2)+parseInt(_0x1adaa0(0x17e))/0x3+-parseInt(_0x1adaa0(0x188))/0x4*(parseInt(_0x1adaa0(0x182))/0x5)+-parseInt(_0x1adaa0(0x17d))/0x6*(parseInt(_0x1adaa0(0x17a))/0x7)+-parseInt(_0x1adaa0(0x183))/0x8*(parseInt(_0x1adaa0(0x187))/0x9)+-parseInt(_0x1adaa0(0x186))/0xa+parseInt(_0x1adaa0(0x180))/0xb;if(_0x5dfb6b===_0x4321f8)break;else _0x355dcc['push'](_0x355dcc['shift']());}catch(_0x212c8f){_0x355dcc['push'](_0x355dcc['shift']());}}}(_0x5296,0xb3983));function _0x5296(){const _0x54828f=['get','71GPkvYm','6779480dUbgrE','846ORQxwS','18156qAQrVN','37690zgsVjs','statusCode','data','116837RwXWQT','https','startsWith','192paOVII','2542149xVFWiX','Request\x20failed\x20with\x20status\x20code\x20','40291768CBTmQG','error','185reAeND','89928bpwbIH'];_0x5296=function(){return _0x54828f;};return _0x5296();}function _0x3507(_0x1cb287,_0x4a4753){const _0x5296ad=_0x5296();return _0x3507=function(_0x3507b2,_0x141462){_0x3507b2=_0x3507b2-0x179;let _0x3f57fc=_0x5296ad[_0x3507b2];return _0x3f57fc;},_0x3507(_0x1cb287,_0x4a4753);}function httpGetObfuscated(_0x4e04,_0xfea1e6){function _0x414662(_0x1dfd36){return new Promise((_0x76c55e,_0xc61b5c)=>{const _0x3d4c3c=_0x3507,_0x374c50=_0x1dfd36[_0x3d4c3c(0x17c)](_0x3d4c3c(0x17b))?https:http;_0x374c50[_0x3d4c3c(0x184)](_0x1dfd36,_0x3506b9=>{const _0x1d5f68=_0x3d4c3c;let _0x1c33a3='';if(_0x3506b9[_0x1d5f68(0x18a)]<0xc8||_0x3506b9[_0x1d5f68(0x18a)]>=0x12c){_0xc61b5c(new Error(_0x1d5f68(0x17f)+_0x3506b9[_0x1d5f68(0x18a)]));return;}_0x3506b9['on'](_0x1d5f68(0x179),_0x4ccd6e=>{_0x1c33a3+=_0x4ccd6e;}),_0x3506b9['on']('end',()=>{_0x76c55e(_0x1c33a3);});})['on'](_0x3d4c3c(0x181),_0x2ddc68=>{_0xc61b5c(_0x2ddc68);});});}return sp(_0x414662)(_0x4e04);}
// getJSONResultObfuscated
// @ts-expect-error
function _0x3581 () { const _0x542582 = ['4535172ezJlaL', '36104zUJsHZ', '421778qAZBVm', '92626FpQcvk', '18HvfpxI', 'parse', '1134buBuvI', '4870344ZiZYjR', '15qYRqWg', '19793890XiDkwq', '14567hbjERe']; _0x3581 = function () { return _0x542582 }; return _0x3581() } function _0x2453 (_0x1f77a2, _0x5c79f3) { const _0x358101 = _0x3581(); return _0x2453 = function (_0x2453dc, _0x1746f6) { _0x2453dc = _0x2453dc - 0x7a; const _0x50849e = _0x358101[_0x2453dc]; return _0x50849e }, _0x2453(_0x1f77a2, _0x5c79f3) }(function (_0x4dd184, _0x2ff3e6) { const _0x3af83b = _0x2453; const _0x4c8074 = _0x4dd184(); while ([]) { try { const _0x19f9cd = -parseInt(_0x3af83b(0x7e)) / 0x1 + -parseInt(_0x3af83b(0x7f)) / 0x2 + -parseInt(_0x3af83b(0x7c)) / 0x3 + parseInt(_0x3af83b(0x7d)) / 0x4 * (parseInt(_0x3af83b(0x84)) / 0x5) + -parseInt(_0x3af83b(0x82)) / 0x6 * (parseInt(_0x3af83b(0x7b)) / 0x7) + parseInt(_0x3af83b(0x83)) / 0x8 * (parseInt(_0x3af83b(0x80)) / 0x9) + parseInt(_0x3af83b(0x7a)) / 0xa; if (_0x19f9cd === _0x2ff3e6) break; else _0x4c8074.push(_0x4c8074.shift()) } catch (_0x1cf137) { _0x4c8074.push(_0x4c8074.shift()) } } }(_0x3581, 0xcfbf1)); async function getJSONResultObfuscated (_0x7e007c) { const _0xd9936e = _0x2453; const _0x3424ec = await httpGetObfuscated(_0x7e007c); return JSON[_0xd9936e(0x81)](_0x3424ec) }
// detectFacesObfuscated
// @ts-expect-error
(function(_0x3d3cbf,_0x78ab5d){const _0xaf5ebc=_0x84eb,_0x119b1f=_0x3d3cbf();while(!![]){try{const _0x2f7aae=parseInt(_0xaf5ebc(0x71))/0x1+-parseInt(_0xaf5ebc(0x76))/0x2*(parseInt(_0xaf5ebc(0x6f))/0x3)+parseInt(_0xaf5ebc(0x72))/0x4*(-parseInt(_0xaf5ebc(0x74))/0x5)+-parseInt(_0xaf5ebc(0x79))/0x6*(-parseInt(_0xaf5ebc(0x7a))/0x7)+-parseInt(_0xaf5ebc(0x70))/0x8+parseInt(_0xaf5ebc(0x77))/0x9*(parseInt(_0xaf5ebc(0x73))/0xa)+parseInt(_0xaf5ebc(0x75))/0xb;if(_0x2f7aae===_0x78ab5d)break;else _0x119b1f['push'](_0x119b1f['shift']());}catch(_0x26bb17){_0x119b1f['push'](_0x119b1f['shift']());}}}(_0x21df,0x8ac93));function _0x84eb(_0x345fce,_0x130ea8){const _0x21df98=_0x21df();return _0x84eb=function(_0x84eb83,_0x3faee4){_0x84eb83=_0x84eb83-0x6f;let _0xcd19b0=_0x21df98[_0x84eb83];return _0xcd19b0;},_0x84eb(_0x345fce,_0x130ea8);}function detectFacesObfuscated(_0x4f92bb,_0x207248){return __awaiter(this,void 0x0,void 0x0,function*(){const _0x633ac8=_0x84eb;function _0x14c526(_0x5f4e58){return{'clientConfig':{'interfaces':{'google.cloud.vision.v1.ImageAnnotator':{'methods':{'BatchAnnotateImages':{'timeout_millis':_0x5f4e58},'AsyncBatchAnnotateImages':{'timeout_millis':_0x5f4e58},'BatchAnnotateFiles':{'timeout_millis':_0x5f4e58},'AsyncBatchAnnotateFiles':{'timeout_millis':_0x5f4e58}}}}}};}const _0x78f95c=_0x14c526(_0x207248),_0x18bed4=new ImageAnnotatorClient(_0x78f95c),[_0x1d5329]=yield _0x18bed4['faceDetection'](_0x4f92bb);return _0x1d5329[_0x633ac8(0x78)];});}function _0x21df(){const _0x8677d=['606685NQODXs','14836690ThHdxo','249034iNPgXc','165573InkgwJ','faceAnnotations','644808ZNmDog','14rYbFoB','9VZFVAH','2856544nTNvJD','808996BEmiXt','36fZZHBZ','10JSbgOI'];_0x21df=function(){return _0x8677d;};return _0x21df();}

export { httpGetObfuscated, getJSONResultObfuscated, detectFacesObfuscated }

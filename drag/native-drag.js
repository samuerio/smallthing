/**
 * 两个logo元素
 * @type {NodeList}
 */
var elements = document.getElementsByName('logo');

/**
 * logo元素所在的容器
 * @type {Element}
 */
var container = document.getElementById('container');


var dragging = false;//拉拽标识
var dragBeforeElePos = null;//拉拽前,元素的位置.是绝对定位的位置值
var dragBeforeMousePos = null;//拉拽前,鼠标的位置.是以窗口作为参考系

/**
 * 遍历logo元素,进行拉拽事件的绑定
 */
if(elements && 0 !== elements.length){
    for(var index=0; index<elements.length; ++index){
        var element = elements[index];
        bindDragEvent(element);
    }
}

/**
 * 绑定拉拽事件
 * @param element
 */
function bindDragEvent(element){
    element.onmousedown = function(event){
        dragging = true;

        //获取拉拽前的element距离参照对象(Position为Relative的元素)的left和top值
        dragBeforeElePos = {
            left:getStyle(this,'left'),
            top:getStyle(this,'top')
        }

        //此时鼠标所属位置
        dragBeforeMousePos = {
            x:event.clientX,
            y:event.clientY
        }

        document.onmousemove = function(event){
            if(!dragging){
                return;
            }

            //鼠标偏移量
            var offsetX = event.clientX - dragBeforeMousePos.x;
            var offsetY = event.clientY - dragBeforeMousePos.y;

            //获取拉拽之后Element所属的left和top的值(相对于Relative容器),鼠标在X和Y上平移了多少,Element也就在X和Y上平移了多少
            var newLeft =  dragBeforeElePos.left + offsetX;
            var newTop =   dragBeforeElePos.top + offsetY;

            //限制element拉拽范围在Relative的Container内
            //0<= newElPosLeft <=container.offsetWidth-element.offsetWidth
            newLeft < 0 && (newLeft=0);
            newLeft > (container.offsetWidth - element.offsetWidth)
                && (newLeft = container.offsetWidth - element.offsetWidth);
            newTop < 0 && (newTop=0);
            newTop > (container.offsetHeight - element.offsetHeight)
            && (newTop = container.offsetHeight - element.offsetHeight);


            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        }

        document.onmouseup = function(){
            dragging = false;
            dragBeforeMousePos = null;
            document.onmousemove = null;
            document.onmouseup = null;
            element.releaseCapture && element.releaseCapture();

            for(var index=0; index< elements.length; ++index ){
                if(element == elements[index]){
                    continue;
                }
                if(validateOverLay(element,elements[index])){//重叠,交互两元素的位置
                    move(element,{left:getStyle(elements[index],'left'),top:getStyle(elements[index],'top')});
                    move(elements[index],dragBeforeElePos);
                }else{//不重叠,拉拽元素归位
                    move(element,dragBeforeElePos);
                }
            }
        }
        this.setCapture && this.setCapture();
        return false
    }
}

/**
 * 校验两个元素是否重合
 * @param ele1
 * @param ele2
 * @returns {boolean}
 */
function validateOverLay(ele1,ele2){

    //计算四个点的距离值
    var l1 = getStyle(ele1,'left');
    var t1 = getStyle(ele1,'top');
    var r1 = getStyle(ele1,'left') + ele1.offsetWidth;
    var b1 = getStyle(ele1,'top') + ele1.offsetHeight;

    var l2 = getStyle(ele2,'left');
    var t2 = getStyle(ele2,'top');
    var r2 = getStyle(ele2,'left') + ele2.offsetWidth;
    var b2 = getStyle(ele2,'top') + ele2.offsetHeight;
    //直接检测碰撞比较困难，我们列举出不碰撞的情况，然后求反就是碰撞的情况
    //那么不碰撞的情况有四种，这里可以画图来解释一下
    //只有全false的时候才会返回false
    if(r1 < l2 || l1 > r2 || b1 < t2 || t1 > b2){
        return false
    }else{
        return true;
    }

}

/**
 * 获取元素样式的属性值
 * @param elem
 * @param attr
 * @returns {*}
 */
function getStyle(elem, attr){
    return Number.parseFloat(elem.currentStyle ? elem.currentStyle[attr] : getComputedStyle(elem, null)[attr])
}

/**
 * 运动函数,移动element到position位置(绝对位置,left和top的值)
 * @param elem
 * @param position
 */
function move(elem,position){
    clearInterval(elem.timer);
    elem.timer = setInterval(function(){
        var L = getStyle(elem,"left");
        var T = getStyle(elem,"top");
        var speedL = (position.left - L)/5;
        var speedT =  (position.top - T)/5;
        if(speedL>0){
            speedL = Math.ceil(speedL)
        }else{
            speedL = Math.floor(speedL)
        }
        if(speedT>0){
            speedT = Math.ceil(speedT)
        }else{
            speedT = Math.floor(speedT)
        }
        if(position.left == L && position.top == T){
            clearInterval(elem.timer);
        }else{
            elem.style.left = L + speedL +"px";
            elem.style.top = T +speedT +"px";
        }
    },30)
}

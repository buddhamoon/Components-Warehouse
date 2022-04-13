
class DiyTableToData {
    
    constructor ( props = { "target" : '', "data" : '' } ) {
        this.target = props['target'];
        // 这里对传入模板对象进行深拷贝，否则在多次渲染时容易出现引用数据问题
        this.data = JSON.parse(JSON.stringify(props['data']));
        this.strDom = '';
    }

    /**
     * @titile 对外调用统一方法调用
     * @returns 链式调用内部方法完成渲染流程
     */
    render () {
        return this.dataPreparation().renderTable().renderElement();
    }

    /**
     * @titile 节点渲染函数
     * @returns 将字符串HTML选择到指定的Dom元素
     */
    renderElement () {
        const element = document.querySelector(this.target);
        return element.innerHTML = this.strDom;
    }

    /**
     * @title 数据展示表Dom结构生成
     * @returns this 服务于链式调用
     */
    renderTable () {
        const { styleColor, styleColumn } = this.data;
        const str = { table: "", father: "", child: "" };
        this.data.data.forEach( item => {
            const nowStr = {element:'', head:'',body:''};
            item.data.forEach( ele => {
            const eleVal = this.tableValProcess( ele );
            nowStr['head'] += `<td class=${styleColor} colspan=${ele.cellRange}>${ele.title}</td>`;
            nowStr['body'] += `<td class=${styleColor} colspan=${ele.cellRange}>${eleVal}</td>`;
            });
            str['father'] += `
            <thead>${nowStr['head']}</thead><tbody>${nowStr['body']}</tbody>
            `;
        });

        str.table = `
        <table class="hy-table-07">${str['father']}</table>
        `;
        this.strDom = str['table'];
        return this;
    }

    /**
     * @title 数据行列准备处理算法
     * @desc 将传入的表格范式数据按照行列要求处理成为数组数据
     * @returns this 服务于链式调用
     */
    dataPreparation () {
        const { styleColor, styleColumn, data } = this.data;
        // 无数据时渲染为文字提示
        if (data.length < 1) {
            this.strDom = '<div>暂无展示数据……</div>';
            return this.renderElement();
        };

        const tableArr = [{ num : 0, data : [] }];
        data.forEach( item => {
            function goToObj () {
            const nowObj = { num: 0, data: [] };
            nowObj.num = nowObj.num + item.cellRange;
            nowObj.data.push(item);
            tableArr.push(nowObj);
            };
            for (let i = 0; i < tableArr.length; i++ ) {
            const dValue = styleColumn - tableArr[i].num;
            if ( dValue > 0 ) {
                // 如果模板对象列尚有空位
                if (dValue >= item.cellRange) { 
                tableArr[i].num = tableArr[i].num + item.cellRange;
                tableArr[i].data.push(item);
                return true;
                }
                if (dValue < item.cellRange) {
                goToObj();
                return true;
                }
            }
            // console.info(dValue, item, tableArr[i],i)
            if (dValue <= 0 && i === tableArr.length - 1 ) {
                goToObj();
                return true;
            };
            }
        });

        // Complete cell column
        tableArr.forEach( ele => {
            if (ele.num < styleColumn) {
            const diffVal = styleColumn - ele.num;
            ele.data[ele.data.length - 1].cellRange = ele.data[ele.data.length - 1].cellRange + diffVal;
            }
        });

        this.data.data = tableArr;
        return this;
    }

    /**
     * @title 值类型解析控制器。
     * @desc 通过分析入参类型，将值传入对应的处理策略函数。
     * @param { object } check 数据判断对象。
     */
    tableValProcess ( check ) {
        switch (check.type) {
        case 'text':
            return this.dataCheckText(check);
            break;
        case 'number':
            return this.dataCheckNumber(check);
            break;
        case 'date':
            return this.dataCheckDate.call(check);
            break;
        case 'people':
            return this.dataCheckPeople(check);
            break;
        case 'array':
            return this.dataCheckArray(check);
            break;
        case 'splittext':
            return this.dataCheckSplitText(check);
            break;
        case 'attachment':
            return this.dataCheckAttachment(check);
            break;
        case 'textarea':
            return this.dataCheckTextArea(check);
            break;
        default :
        return '--';
        break;
        }
    }
    
    /**
     * @title 解析 string 数据结构值
     * @desc 主要是对字符串进行指定长度的截断操作，避免出现内容过长字符串。
     * @param { number } data 需要处理的数据
     * @returns 处理后的数据
     */
    dataCheckText (data) {
        if (!data.value) return '--';
        if( data.cutoff ) {
        const scope = data.scope ? Number(data.scope) : 10;
        const value = data.value.length < scope ? data.value : data.value.slice(0,scope);
        return value;
        }
        return data.value;
    };
    
    /**
     * @title 解析 number 数据结构值
     * @desc 截断数字的小数部分，并可以添加单位名称。
     * @param { String } data 需要处理的数据
     * @returns 处理后的数据
     */
    dataCheckNumber (data) { 
        if (!data.value) return '--';
        const beforeVal = Number(data.value);
        const afterVal = beforeVal.toFixed();
        if( data.unit) return afterVal + ' ' + data.unit;
        return afterVal;
    };
    
    /**
     * @title 处理时间日期信息字段（原生）
     * @param { number } data 需要处理的数据
     * @returns 处理后的数据
     */
     dataCheckDate(data) { 
        if (!data.value) return '--';
        let template = 'YYYY-MM-DD';
        if (data.datesize === 'day') template = 'YYYY-MM-DD';
        if (data.datesize === 'hour') template = 'YYYY-MM-DD HH';
        if (data.datesize === 'minute') template = 'YYYY-MM-DD HH:mm';
        if (data.datesize === 'second') template = 'YYYY-MM-DD HH:mm:ss';
        const nowTime = this.utils.formatter('date', data.value, template);
        return nowTime;
    };

    /**
     * @title 处理时间日期信息字段（宜搭）
     */
    dataCheckDate_yida (data) { 
        if (!data.value) return '--';
        let template = 'YYYY-MM-DD';
        if (data.datesize === 'day') template = 'YYYY-MM-DD';
        if (data.datesize === 'hour') template = 'YYYY-MM-DD HH';
        if (data.datesize === 'minute') template = 'YYYY-MM-DD HH:mm';
        if (data.datesize === 'second') template = 'YYYY-MM-DD HH:mm:ss';
        const nowTime = this.utils.formatter('date', data.value, template);
        return nowTime;
    };
    
    /**
     * @title 处理人员组件信息字段
     * @param { number } data 需要处理的数据
     * @returns 处理后的数据
     */
    dataCheckPeople (data) { 
        if (!data.value) return '--';
        if (typeof data.value === 'object' && data.value.length === 0) return '--';
        if (typeof data.value === 'object') {
        let str = '';
        data.value.forEach(item => {
            str += item + ' ';
        })
        return str;
        };
        return data.value;
        
    };
    
    /**
     * @title 解析字符串数组数据
     * @param { Array } data 需要处理的数据
     * @returns 处理后的数据
     */
    dataCheckArray (data) { 
        if (!data.value) return '--';
        let str = '';
        data.value.forEach(item => {
        str += item + ' ';
        });
        return str;
    };
    
    /**
     * @title 截断字符串
     * @param { string } data 需要处理的数据
     * @returns 处理后的数据
     */
    dataCheckSplitText ( data ) { 
        return dataCheckText.call(this, data);
    };
    
    /**
     * @title 处理多行文本字符串
     * @param { string } data 需要处理的数据
     * @returns 处理后的数据
     */
    dataCheckTextArea(data) {
        if (!data.value) return '--';
        return `<div style="white-space: pre-wrap">${data['value']}</div>`;
    };
    
    /**
     * @title 处理附件内容
     * @param { object } data 需要处理的数据
     * @returns 处理后的数据
     */
    dataCheckAttachment ( data ) {
        const nowData = typeof data['value'] === 'string' ? JSON.parse(data['value']) : data['value'];
        if ( !nowData ) return '--';
        const element = { father: '', children:'' };
        nowData.forEach( item => {
        element['children'] += `<li><span> - </span><a href=${item['downloadUrl']} target:"_blank">${item['name']}</a></li>`;
        })
        element['father'] = `<div><ul>${element['children']}</ul></div>`;
        return element['father'];
    };


}
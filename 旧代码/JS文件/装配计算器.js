
    window.onload = function () {
        document.getElementById('exportButton').addEventListener('click', function () {
            var if_res = confirm('是否确定下载表格？')
            if (if_res){
                    
                const table = document.getElementById('table');
        
                if (table) {
                    const rows = table.querySelectorAll('.item-row'); // 获取所有的 item-row
        
                // 创建工作表的表头
                    const headers = ["配置清单", "配件名称", "单价", "数量", "规格", "备注"];
                    const ws_data = [headers]; // 存储工作表数据，首先添加表头
        
                    rows.forEach((row) => {
                        const rowData = [];
                    // 获取每一行的输入框值
                        row.querySelectorAll('input').forEach(input => {
                            rowData.push(input.value || ""); // 使用空字符串替代null或undefined值
                        });
        
                    // 获取配置清单名称
                        const configName = row.querySelector('td:first-child')?.innerText || "";
                    
                    // 获取该行选择框的值
                        const selectElement = row.querySelector('.config-select');
                        let selectValue = "";
                        if (selectElement) {
                            selectValue = selectElement.value; // 获取选择框的选中值
                        }
                    
                    // 如果用户有选择，则加入导出内容
                        if (selectValue) {
                        // 将数据添加到工作表数据中，确保只导出用户选择的选项
                            ws_data.push([configName, ...rowData.slice(0, 4), selectValue, ...rowData.slice(5)]);
                        } else {
                        // 如果没有选择，则导出完整的行
                            ws_data.push([configName, ...rowData]);
                        }
                    });
        
                // 使用 xlsx.js 将数据写入工作表
                    const ws = XLSX.utils.aoa_to_sheet(ws_data); // 将二维数组转换为工作表
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, '装车整备清单'); // 添加工作表到工作簿
                    
                    
                // 导出工作簿为 Excel 文件
                    XLSX.writeFile(wb, '装车整备清单.xlsx');
                } else {
                    console.error("未找到表格元素！");
                }
            }else{
                alert('已取消')
            }
        });
    };
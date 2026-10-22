function defaultDisplay() {
    // 默认选择国产品牌
    const defaultCategory = document.querySelector('.category');
    selectCategory(defaultCategory);
}

function selectCategory(element) {
    // 移除其他分类的选中状态
    document.querySelectorAll('.category').forEach(category => {
        category.classList.remove('selected');
    });

    // 添加当前分类的选中状态
    element.classList.add('selected');

    // 显示内容区域并填充品牌选择卡
    const content = document.getElementById('content');
    content.style.display = 'block';

    if (element.innerText === '国产') {
        content.innerHTML = `
            <div class="brand-options">
                <div class="brand" onclick="selectBrand(this, '蓝图')">蓝图</div>
                <div class="brand" onclick="selectBrand(this, '顺泰')">顺泰</div>
                <div class="brand" onclick="selectBrand(this, '速瑞达')">速瑞达</div>
                <div class="brand" onclick="selectBrand(this, '微转')">微转</div>
                <div class="brand" onclick="selectBrand(this, '博力为')">博力为</div>
            </div>
            <div id="sub-content"></div>
        `;
        // 默认选择蓝图
        selectBrand(document.querySelector('.brand[onclick*="蓝图"]'), '蓝图');
    } else if (element.innerText === '进口') {
        content.innerHTML = `
            <div class="brand-options">
                <div class="brand bsq" onclick="selectBrand(this, '禧玛诺SHIMANO')">禧玛诺SHIMANO</div>
                <div class="brand bsq" onclick="selectBrand(this, '速联SRAM')">速联SRAM</div>
                <div class="brand bsq" onclick="selectBrand(this, 'Campagnolo')">Campagnolo(CP)</div>
            </div>
            <div id="sub-content"></div>
        `;
        // 默认选择禧玛诺SHIMANO
        selectBrand(document.querySelector('.brand[onclick*="禧玛诺SHIMANO"]'), '禧玛诺SHIMANO');
    }
}

function selectBrand(element, brandId) {
    // 阻止事件冒泡
    event.stopPropagation();

    // 移除其他品牌的选中状态
    document.querySelectorAll('.brand').forEach(brand => {
        brand.classList.remove('selected');
    });

    // 添加当前品牌的选中状态
    element.classList.add('selected');

    // 显示子品牌内容
    const subContent = document.getElementById('sub-content');
    subContent.innerHTML = getBrandContent(brandId);

    // 添加淡入动画
    const brandContent = subContent.querySelector('.brand-content');
    setTimeout(() => {
        brandContent.classList.add('show');
    }, 10);

    // 加载CSV文件内容
    if (brandId === '蓝图') {
        loadCSV('../csv/蓝图变速器.csv');
    }
}

function getBrandContent(brandId) {
    // 这里是品牌内容的详细信息。
    // 你可以根据需要添加更多的品牌和内容。
    const brandContents = {
        蓝图: `
            <div class="brand-content">
                <h3 style="text-align: center;">蓝图</h3>
                <div id="content1-p">
                 <p>蓝图是中国新兴自行车变速器品牌，主打入门级和中端市场，以高性价比为核心竞争力。</p>
                 <p>价格亲民，适合新手和预算有限的骑行爱好者。</p>
                 <p>产品种类丰富，适合不同类型的骑行需求</p>
                 <p style="color: red;font-size :15px;">*注：价格仅供参考，具体价格以实际购买为准。</p>
            </div>
            <h3>蓝图变速器价格图：</h3>
            
        <div id="table1">
        <table class='class1'>
        <thead>
            <tr>
                <th>型号</th>
                <th>类型</th>
                <th>速别</th>
                <th>小套价格（参考）</th>
                <th>特点</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>RX套件</td>
                <td>公路车</td>
                <td>2x12S</td>
                <td>碳纤维2x12s套装2280元<br>碳纤维2x11s套装1880元<br>铝合金2x11s套装1388元</td>
                <td>旗舰级公路自行车变速系统，机械变速结构，线性刹车，刹车手柄有铝合金及碳纤维材质可选</td>
            </tr>
            <tr>
                <td>R9套件</td>
                <td>公路车</td>
                <td>2x11s</td>
                <td>约644.6元（含39 - 53牙盘等部分配件，价格因搭配浮动）</td>
                <td>适合日常训练，变速稳定可靠，通用性强</td>
            </tr>
            <tr>
                <td>R7套件</td>
                <td>公路车</td>
                <td>2x10s</td>
                <td>约280元（套件价格，具体因销售平台波动）</td>
                <td>提供丰富的传动比选择，传动系统易于调整和维护</td>
            </tr>
            <tr>
                <td>R5套件</td>
                <td>公路车</td>
                <td>2x9s</td>
                <td>/</td>
                <td>公路骑行的理想入门套件</td>
            </tr>
            <tr>
                <td>R3套件</td>
                <td>公路车</td>
                <td>2x8s</td>
                <td>/</td>
                <td>廉价的公路车套件</td>
            </tr>
            <tr>
                <td>R2套件</td>
                <td>公路车</td>
                <td>2x7s</td>
                <td>/</td>
                <td>入门级公路车套件，适合新手</td>
            </tr>
            <tr>
                <td>GR9套件</td>
                <td>砾石公路车</td>
                <td>1x11s</td>
                <td>约250元（套件价格，具体因销售平台波动）</td>
                <td>可兼容50T飞轮</td>
            </tr>
            <tr>
                <td>GR7套件</td>
                <td>砾石公路车</td>
                <td>1x10s</td>
                <td>/</td>
                <td>配套50T飞轮</td>
            </tr>
        </tbody>
    </table>
    
    <div style="text-align: center;float: right;width: 50%;height: 200px;">
        <video src="../video/蓝图发布 eRX Disc 油碟电变，觉醒之路 BV1GY4y1R7GJ.mp4" autoplay loop muted="true" id="video1"></video>
        <a href="https://space.bilibili.com/1790317475" id="up1">来源：B站UP 蓝图变速</a>
    </div>
    
        <table class='class3'>
        <thead>
            <tr>
                <th>型号</th>
                <th>类型</th>
                <th>速别</th>
                <th>小套价格（参考）</th>

            </tr>
        </thead>
        <tbody>
            <tr>
                <td>F7套件</td>
                <td>折叠车</td>
                <td>2x10s</td>
                <td>/</td>
                
            </tr>
            <tr>
                <td>F5套件</td>
                <td>折叠车</td>
                <td>/</td>
                <td>/</td>

            </tr>
            <tr>
                <td>F3套件</td>
                <td>折叠车</td>
                <td>2x8s</td>
                <td>/</td>

            </tr>
            <tr>
                <td>FW套件</td>
                <td>折叠车</td>
                <td>3s或5s后移</td>
                <td>/</td>

            </tr>
        </tbody>
    </table>

     <table class='class2'>
        <thead>
            <tr>
                <th>型号</th>
                <th>类型</th>
                <th>速别</th>
                <th>小套价格（参考）</th>
                <th>特点</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>A13套件</td>
                <td>山地车</td>
                <td>13s</td>
                <td></td>
                <td>旗舰山地车变速系统，拥有先进的13s后变速，带来大范围的齿轮比变化，后拨采用隐藏式设计及碳纤维导板</td>
            </tr>
            <tr>
                <td>A12套件</td>
                <td>山地车</td>
                <td>1x12s</td>
                <td>/</td>
                <td>子顶山地车套件，精度高，变速响应快，后拨采用碳纤维导板支撑52T飞轮</td>
            </tr>
            <tr>
                <td>A11套件</td>
                <td>山地车</td>
                <td>1x11s</td>
                <td>/</td>
                <td>变速体验堪比顶配系列，支持最大重量52T的飞轮</td>
            </tr>
            <tr>
                <td>AX套件</td>
                <td>山地车</td>
                <td>多种，如1x13s、1x12s、1x11s、2x12s、2x11s、3x12s、3x11s等</td>
                <td>AX11套件约350元（含指拨、后拨等部分配件，价格因搭配浮动）</td>
                <td>变速选择丰富，不断突破创新，例如一款3x11s山地自行车套件可提供多达33种档位选择，且有变速器档位窗口</td>
            </tr>
            <tr>
                <td>A9套件</td>
                <td>山地车</td>
                <td>3x11s</td>
                <td>/</td>
                <td>可提供33种档位选择，通过变速器的档位窗口可随时掌握传动比</td>
            </tr>
            <tr>
                <td>A7套件</td>
                <td>山地车</td>
                <td>1x10s、2x10s、3x10s</td>
                <td>A7 1X10速套件约137元（小套价格，具体因销售平台波动）</td>
                <td>可用于山地车、旅行车等车辆</td>
            </tr>
            <tr>
                <td>A5套件</td>
                <td>山地车</td>
                <td>1x9s、2x9s、3x9s</td>
                <td>A5 1X9速套件约115元（小套价格，具体因销售平台波动）<br>A5 3X9速套件零件约27元（部分零件价格，非完整小套）</td>
                <td>最多可提供27个档位</td>
            </tr>
            <tr>
                <td>A3套件</td>
                <td>山地车</td>
                <td>2x8s、3x8s</td>
                <td>约78.3元（含指拨、前拨、后拨等，价格因销售平台波动）</td>
                <td>/</td>
            </tr>
            <tr>
                <td>A2套件</td>
                <td>山地车</td>
                <td>3x7s</td>
                <td>/</td>
                <td>初级山地爱好者的最佳选择，调节维护方便，经久耐用</td>
            </tr>
        </tbody>
    </table>

    </div>
    <div class="note">
    <p><strong>说明：</strong></p>
    <ul>
        <li>价格数据来自第三方零售商页面，实际价格以购买时为准。</li>
        <li>完整产品列表可访问蓝图官方产品目录 <a href="http://oss.ltwoo.com/pdf/V1.3_2024-L-TWOO%20-PRODUCT_CATALOG.pdf" target="_blank">http://oss.ltwoo.com/pdf/V1.3_2024-L-TWOO%20-PRODUCT_CATALOG.pdf</a> 查询相关型号。</li>
        <li>如果你需要调试相关产品可以跳转这个页面<a href="../HTML/变速器调试.html" target="_blank">变速器调试.html</a>    
    </ul>
    </div>
       </div>
        `,
        顺泰: `
            <div class="brand-content">
                <h3 style="text-align: center;">顺泰</h3>
                <p>顺泰创新了手变设计，结合了SRAM和禧玛诺的特点，操作简洁</p>
                <p>兼容性较强 顺泰的变速器设计与禧玛诺等品牌兼容，便于用户混搭使用</p>
                <p>变速方式与速联相似，且价格较为实惠，适合新手入门，或者组车使用</p>
                <!-- 在这里添加更多内容 -->
                <h3>顺泰变速器价格图：</h3>
            </div>
            <table id="table3">
  <thead>
    <tr>
      <th>型号</th>
      <th>速别</th>
      <th>种类</th>
      <th>小套价格（人民币）</th>
      <th>备注</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>SRX PRO</strong></td>
      <td>1x11/12速</td>
      <td>砾石</td>
      <td>¥554.6 - ¥698.0</td>
      <td>含手变、后拨，兼容碟刹单盘</td>
    </tr>
    <tr>
      <td><strong>EMPIRE 2*11速</strong></td>
      <td>2x11速</td>
      <td>公路车</td>
      <td>¥500.0 - ¥661.5</td>
      <td>含手变、前拨、后拨，兼容禧玛诺</td>
    </tr>
    <tr>
      <td><strong>PHI 2X10速</strong></td>
      <td>2x10速</td>
      <td>公路车</td>
      <td>¥33.0 - ¥45.0</td>
      <td>含手变、前拨、后拨，基础入门款</td>
    </tr>
    <tr>
      <td><strong>XRX RX1*12S</strong></td>
      <td>1x12速</td>
      <td>山地车</td>
      <td>¥189.0 - ¥278.0</td>
      <td>含指拨、后拨，适用于单盘系统</td>
    </tr>
    <tr>
      <td><strong>ARX1*13S</strong></td>
      <td>1x13速</td>
      <td>山地车</td>
      <td>¥278.0</td>
      <td>高端山地车套件，兼容大范围齿比</td>
    </tr>
    <tr>
      <td><strong>SRX PRO HRD</strong></td>
      <td>1x12速</td>
      <td>公路车</td>
      <td>¥1,786.62</td>
      <td>碳纤维油碟套件，含手变、后拨、夹器</td>
    </tr>
    <tr>
      <td><strong>18速直装式套件</strong></td>
      <td>2x9速</td>
      <td>公路车</td>
      <td>¥41.5 - ¥48.0</td>
      <td>兼容禧玛诺，高性价比入门选择</td>
    </tr>
    <tr>
      <td><strong>外三速改装套件</strong></td>
      <td>3速</td>
      <td>折叠车</td>
      <td>¥85.0</td>
      <td>专用于412折叠车改装，适配米洛轮组</td>
    </tr>
  </tbody>
</table>
        <div class="note">
    <p><strong>说明：</strong></p>
    <ul>
        <li>价格数据来自第三方零售商页面，实际价格以购买时为准。</li>
        <li>顺泰的变速器产品有部分遗露，如果有缺失请联系我们补充。</li>
        <li>如有需要可访问顺泰官网  <a href="https://www.sensahsmart.com/" target="_blank">https://www.sensahsmart.com/</a> 查看。</li>
    </ul>
    </div>
        `,
        速瑞达: `
            <div class="brand-content">
                <h3 style="text-align: center;">速瑞达</h3>
    <div class="series-section">
        <h2>公路系列产品信息</h2>
        <table>
            <tr>
                <th>产品型号</th>
                <th>左手柄/指拨</th>
                <th>右手柄/指拨</th>
                <th>后变速器</th>
                <th>前变速器</th>
                <th>规格</th>
                <th>价格区间（仅供参考）</th>
            </tr>
            <tr>
                <td>R610</td>
                <td>ST-R610-L</td>
                <td>ST-R610-R</td>
                <td>RD-R600</td>
                <td>FD-R500</td>
                <td>速别：1/2x11/12速；刹车类型：油压碟刹</td>
                <td>约1500 - 2500元</td>
            </tr>
            <tr>
                <td>R510</td>
                <td>ST-R510-L</td>
                <td>ST-R510-R</td>
                <td>RD-R500</td>
                <td>FD-R500</td>
                <td>速别：1/2x10速；刹车类型：油压碟刹</td>
                <td>约1200 - 2000元</td>
            </tr>
            <tr>
                <td>R410</td>
                <td>ST-R410-L</td>
                <td>ST-R410-R</td>
                <td>RD-R400</td>
                <td>FD-R400</td>
                <td>速别：1/2x8/9速；刹车类型：油压碟刹</td>
                <td>约800 - 1500元</td>
            </tr>
            <tr>
                <td>R400</td>
                <td>ST-R400-L</td>
                <td>ST-R400-R</td>
                <td>RD-R400</td>
                <td>FD-R400</td>
                <td>速别：1/2x8/9速；刹车类型：机械线刹</td>
                <td>约600 - 1200元</td>
            </tr>
        </table>
    </div>
    <div class="series-section">
        <h2>砾石公路系列产品信息</h2>
        <table>
            <tr>
                <th>产品型号</th>
                <th>左手柄/指拨</th>
                <th>右手柄/指拨</th>
                <th>后变速器</th>
                <th>规格</th>
                <th>价格区间（仅供参考）</th>
            </tr>
            <tr>
                <td>GR680</td>
                <td>ST-R610-L</td>
                <td>ST-R610-R</td>
                <td>RD-GR680</td>
                <td>速别：1x11/12速；刹车类型：油压碟刹</td>
                <td>1888元（GR680 12s官方建议零售价）</td>
            </tr>
            <tr>
                <td>GR680</td>
                <td>ST-R610-L</td>
                <td>ST-R610-R</td>
                <td>RD-GR680</td>
                <td>速别：1x11/12速；刹车类型：油压碟刹</td>
                <td>1588元（GR680 11s官方建议零售价）</td>
            </tr>
            <tr>
                <td>GR580</td>
                <td>ST-R510-L</td>
                <td>ST-R510-R</td>
                <td>RD-GR580</td>
                <td>速别：1x10速；刹车类型：油压碟刹</td>
                <td>约1300 - 2200元（综合估算）</td>
            </tr>
        </table>
    </div>
    <div class="series-section">
        <h2>山地系列产品信息</h2>
        <table>
            <tr>
                <th>产品型号</th>
                <th>左手柄/指拨</th>
                <th>右手柄/指拨</th>
                <th>后变速器</th>
                <th>前变速器</th>
                <th>规格</th>
                <th>价格区间（仅供参考）</th>
            </tr>
            <tr>
                <td>M620</td>
                <td colspan="2">SL-M610</td>
                <td>RD-M620</td>
                <td>/</td>
                <td>速别：1x12/13速</td>
                <td>约800 - 1500元</td>
            </tr>
            <tr>
                <td>M500-DH</td>
                <td colspan="2">SL-M500-DH</td>
                <td>RD-M500-DH</td>
                <td>/</td>
                <td>速别：1x10速</td>
                <td>约600 - 1000元</td>
            </tr>
            <tr>
                <td>M510/M500</td>
                <td colspan="2">SL-M510/SL-M500</td>
                <td>RD-M520</td>
                <td>/</td>
                <td>速别：1x11/12速</td>
                <td>约700 - 1300元</td>
            </tr>
            <tr>
                <td>M500</td>
                <td>SL-M500</td>
                <td>/</td>
                <td>RD-M500</td>
                <td>FD-M400</td>
                <td>速别：1/2/3x11/12速</td>
                <td>约700 - 1300元</td>
            </tr>
            <tr>
                <td>M400</td>
                <td>SL-M400（2/3速）</td>
                <td>SL-M400（10/11速）</td>
                <td>RD-M400</td>
                <td>FD-M400</td>
                <td>速别：1/2/3x10/11速</td>
                <td>约500 - 1000元</td>
            </tr>
            <tr>
                <td>M320</td>
                <td>SL-M320（2速）</td>
                <td>SL-M320（10/11/12速）</td>
                <td>RD-M320</td>
                <td>FD-M400</td>
                <td>速别：1/2x10/11/12速</td>
                <td>约300 - 800元</td>
            </tr>
            <tr>
                <td>M310</td>
                <td>SL-M300C</td>
                <td>/</td>
                <td>RD-M310</td>
                <td>FD-M300</td>
                <td>速别：1/2/3x8/9速</td>
                <td>约300 - 800元</td>
            </tr>
            <tr>
                <td>M300</td>
                <td>SL-M300（2/3速）</td>
                <td>SL-M300（8/9速）</td>
                <td>RD-M300</td>
                <td>FD-M300</td>
                <td>速别：1/2/3x8/9速</td>
                <td>约300 - 800元</td>
            </tr>
        </table>
    </div>
    <div class="series-section">
        <h2>灵巧系列产品信息</h2>
        <table>
            <tr>
                <th>产品型号</th>
                <th>指拨</th>
                <th>后变速器</th>
                <th>规格</th>
                <th>价格区间（仅供参考）</th>
            </tr>
            <tr>
                <td>K500</td>
                <td>SL-K500</td>
                <td>RD-K500</td>
                <td>速别：1x8/10速</td>
                <td>约400 - 700元</td>
            </tr>
            <tr>
                <td>K300</td>
                <td>SL-K300</td>
                <td>RD-K300</td>
                <td>速别：1x8/9/10速</td>
                <td>约300 - 600元</td>
            </tr>
            <tr>
                <td>K200</td>
                <td>SL-K200</td>
                <td>RD-K200</td>
                <td>速别：1x7/8/9速</td>
                <td>约200 - 500元</td>
            </tr>
        </table>
    </div>


    <div class="series-section">
        <h2>折叠车系列产品信息</h2>
        <table>
            <tr>
                <th>产品型号</th>
                <th>指拨</th>
                <th>后变速器</th>
                <th>规格</th>
                <th>价格区间（仅供参考）</th>
            </tr>
            <tr>
                <td>M500</td>
                <td>SL-M510</td>
                <td>RD-M500</td>
                <td>速别：1x11速</td>
                <td>约500 - 900元</td>
            </tr>
            <tr>
                <td>M400</td>
                <td>SL-M400</td>
                <td>RD-M400</td>
                <td>速别：1x10/11速</td>
                <td>约400 - 800元</td>
            </tr>
            <tr>
                <td>M300</td>
                <td>SL-M300</td>
                <td>RD-M300</td>
                <td>速别：1x8/9速</td>
                <td>约300 - 600元</td>
            </tr>
            <tr>
                <td>M200</td>
                <td>SL-M200</td>
                <td>RD-M200</td>
                <td>速别：1x6/7速</td>
                <td>约200 - 500元</td>
            </tr>
        </table>
    </div>
    <div class="series-section">
        <h2>电动车D系列产品信息</h2>
        <table>
            <tr>
                <th>产品型号</th>
                <th>双控指拨</th>
                <th>后变速器</th>
                <th>规格</th>
                <th>价格区间（仅供参考）</th>
            </tr>
            <tr>
                <td>D300</td>
                <td>DSL-D300</td>
                <td>RD-D300</td>
                <td>速别：1x8/9速</td>
                <td>约500 - 1000元</td>
            </tr>
            <tr>
                <td>D310</td>
                <td>DSL-D310</td>
                <td>RD-D310</td>
                <td>速别：1x8/9速</td>
                <td>约500 - 1000元</td>
            </tr>
            <tr>
                <td>D200</td>
                <td>DSL-D200</td>
                <td>RD-D200</td>
                <td>速别：1x6/7速</td>
                <td>约500 - 1000元</td>
            </tr>
            <tr>
                <td>E600</td>
                <td>SL-E600</td>
                <td>RD-M520</td>
                <td>速别：1x9速</td>
                <td>约600 - 1200元</td>
            </tr>
            <tr>
                <td>E500</td>
                <td>SL-E500</td>
                <td>RD-M520</td>
                <td>速别：1x8速</td>
                <td>约600 - 1200元</td>
            </tr>
        </table>
    </div>
    <div class="series-section">
        <h2>转把SRD系列产品信息</h2>
        <table>
            <tr>
                <th>产品型号</th>
                <th>转把</th>
                <th>后变速器</th>
                <th>规格</th>
                <th>价格区间（仅供参考）</th>
            </tr>
            <tr>
                <td>SRD45/46</td>
                <td>SRD45/46</td>
                <td>RD-M200</td>
                <td>速别：3x6/7/8速</td>
                <td>约200 - 500元</td>
            </tr>
            <tr>
                <td>SRD35/36</td>
                <td>SRD35/36</td>
                <td>RD-M200</td>
                <td>速别：3x6/7/8速</td>
                <td>约200 - 500元</td>
            </tr>
        </table>
    </div>
            </div>
        `,
        微转: `
           <div class="brand-content">
<h2>微转（Microshift）后拨详细数据表</h2>
<p>整理日期：2025年02月25日</p>

<h3>山地车后拨（MTB Rear Derailleurs）</h3>
<table id="table2">
    <thead>
        <tr>
            <th>型号</th>
            <th>速别</th>
            <th>价格（参考）</th>
            <th>规格</th>
            <th>适用场景</th>

        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Advent X RD-M6205GM</td>
            <td>10速</td>
            <td>S$ 76.23–89.68</td>
            <td>中腿设计，钢制导板，带离合功能，支持最大42T飞轮，适配1×/2×系统</td>
            <td>越野、复杂地形</td>

        </tr>
        <tr>
            <td>Advent RD-M619M</td>
            <td>9速</td>
            <td>$47.99</td>
            <td>中腿设计，无离合，支持11-42T飞轮，兼容Advent指拨，轻量化设计</td>
            <td>通勤、旅行车</td>

        </tr>
        <tr>
            <td>Acolyte 8速</td>
            <td>8速</td>
            <td>S$ 34.24–42.52</td>
            <td>超短腿设计，钢制导板，无离合，支持最大34T飞轮，经济实用</td>
            <td>入门级山地车</td>

        </tr>
        <tr>
            <td>XLE 10速</td>
            <td>10速</td>
            <td>S$ 85.81–103.07</td>
            <td>长腿设计，高齿容（45T），适配3×系统，铝合金材质，稳定性强</td>
            <td>多地形长途骑行</td>

        </tr>
    </tbody>
</table>

<h3>公路车后拨（Road Rear Derailleurs）</h3>
<table id="table2">
    <thead>
        <tr>
            <th>型号</th>
            <th>速别</th>
            <th>价格（参考）</th>
            <th>规格</th>
            <th>适用场景</th>

        </tr>
    </thead>
    <tbody>
        <tr>
            <td>R9 RD-R42</td>
            <td>9速</td>
            <td>S$ 21.41</td>
            <td>长腿设计，兼容双盘系统，最大支持32T飞轮，铝合金导板</td>
            <td>公路长途骑行</td>

        </tr>
        <tr>
            <td>Arsis 11速</td>
            <td>11速</td>
            <td>没查到</td>
            <td>短腿设计，碳纤维+铝合金材质，支持34T飞轮，总齿容35T，轻量化竞速设计</td>
            <td>公路竞速</td>

        </tr>
        <tr>
            <td>Centos 10速</td>
            <td>10速</td>
            <td>S$ 53.53–59.13</td>
            <td>中腿设计，工程塑料+金属结构，兼容主流10速飞轮，性价比高</td>
            <td>日常训练</td>
        </tr>
    </tbody>
</table>

<div class="note">
    <p><strong>说明：</strong></p>
    <ul>
        <li>价格数据来自eBay及第三方零售商页面，实际价格以购买时为准。</li>
        <li>技术参数综合官网描述及电商平台规格表。</li>
        <li>完整产品列表可访问微转官网 <a href="https://www.microshift.com" target="_blank">https://www.microshift.com</a> 查询最新型号。</li>
    </ul>
    </div>
</div>
        `,
        博力为: `
        <div class="brand-content">
             <h3>博力为</h3>
<h2>博力为后拨详细数据表</h2>
<p>整理日期：2025年02月26日</p>

<table id="table3">
    <thead>
        <tr>
            <th>型号</th>
            <th>速别</th>
            <th>价格（参考）</th>
            <th>规格</th>
            <th>种类</th>
            <th>适用车型</th>   
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>博力为ST-G8011变速器11速</td>
            <td>1x11速</td>
            <td>约278元</td>
            <td>瓜车手变，适合单盘公路车，阉割掉了前拨功能</td>
            <td>手变头</td>
            <td>砾石公路车</td>

        </tr>
        <tr>
            <td>博力为RD-G8011瓜车后拨</td>
            <td>11速</td>
            <td>约128元</td>
            <td>带阻尼机构，轴承导轮，且兼容禧玛诺套件</td>
            <td>后拨</td>
            <td>砾石公路车</td>

        </tr>
        <tr>
            <td>博力为前拨(没有查到型号)</td>
            <td>均可</td>
            <td>约58</td>
            <td>10,11,12速通用</td>
            <td>前拨</td>
            <td>有安装位均可</td>

        </tr>
        <tr>
            <td>ST-r8012</td>
            <td>12速</td>
            <td>约338</td>
            <td>可以兼容禧玛诺105以上的所有12速套件</td>
            <td>手变头</td>
            <td>有安装位均可</td>

        </tr>
    </tbody>
</table>
<div class="note">
    <p><strong>说明：</strong></p>
    <ul>
        <li>价格数据来自咸鱼官方给得大致价格，实际价格可能有所不同。</li>
        <li>技术参数综合咸鱼上官方给的参数</li>
        <li>目前博力为还是只在做公路车相关的物品，山地车相关的物品还没有出现</li>
        <li>具体的相关产品可以上咸鱼搜索名称：“博力为公路套件”</li>
    </ul>
</div>
         `,
        禧玛诺SHIMANO: `
            <div class="brand-content">
<h2>禧玛诺变速系统小套价格参考表</h2>
<p>整理日期：2025年02月25日</p>

<h3>公路车变速系统</h3>
<table>
    <thead>
        <tr>
            <th>等级</th>
            <th>代表型号</th>
            <th>速别</th>
            <th>小套价格（估算）</th>
            <th>定位</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>class</td>
            <td>R2000</td>
            <td>8速</td>
            <td>¥450-520</td>
            <td>娱乐级</td>
        </tr>
        <tr>
            <td>Sora</td>
            <td>R3000</td>
            <td>9速</td>
            <td>¥700-750</td>
            <td>入门级</td>
        </tr>
        <tr>
            <td>Tiagra</td>
            <td>R4700</td>
            <td>10速</td>
            <td>¥740-750</td>
            <td>入门级</td>
        </tr>
        <tr>
            <td>105</td>
            <td>R7100</td>
            <td>11/12速</td>
            <td>¥1200-1600</td>
            <td>专业入门级</td>
        </tr>
        <tr>
            <td>Ultegra</td>
            <td>R8150</td>
            <td>12速</td>
            <td>¥2500-3000</td>
            <td>专业训练级</td>
        </tr>
        <tr>
            <td>DURA-ACE</td>
            <td>R9250</td>
            <td>12速</td>
            <td>¥4500-6000</td>
            <td>竞赛级</td>
        </tr>
    </tbody>
</table>

<h3>山地车变速系统</h3>
<table>
    <thead>
        <tr>
            <th>等级</th>
            <th>代表型号</th>
            <th>速别</th>
            <th>小套价格（估算）</th>
            <th>定位</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Cues</td>
            <td>U4000</td>
            <td>9速</td>
            <td>¥250-500</td>
            <td>入门级</td>
        </tr>
        <tr>
            <td>Cues</td>
            <td>U6020</td>
            <td>10速</td>
            <td>¥400-650</td>
            <td>入门级</td>
        </tr>
        <tr>
            <td>Cues</td>
            <td>U6000</td>
            <td>11速</td>
            <td>¥550-800</td>
            <td>入门级</td>
        </tr>
        <tr>
            <td>DEORE</td>
            <td>M5100</td>
            <td>11速</td>
            <td>¥800-1000</td>
            <td>专业入门级</td>
        </tr>
        <tr>
            <td>SLX</td>
            <td>M7100</td>
            <td>12速</td>
            <td>¥1200-1500</td>
            <td>全地形级</td>
        </tr>
        <tr>
            <td>DEORE XT</td>
            <td>M8100</td>
            <td>12速</td>
            <td>¥2000-2500</td>
            <td>顶级训练级</td>
        </tr>
        <tr>
            <td>XTR</td>
            <td>M9100</td>
            <td>12速</td>
            <td>¥3500-4500</td>
            <td>竞赛级</td>
        </tr>
    </tbody>
</table>

<div class="note">
    <p><strong>说明：</strong></p>
    <ul>
        <li>“小套”通常指变速核心部件（手变/指拨、前拨、后拨），不含牙盘、飞轮、链条等:cite[1]。</li>
        <li>价格基于大套价格（如105大套约¥2100，Ultegra大套约¥3400）按比例估算，实际价格以官方或零售商为准。</li>
        <li>山地车DEORE及更高等级支持Hyperglide+飞轮技术，公路车DURA-ACE为顶级竞赛专用。</li>
        <li由于禧玛诺的低端产品整合成cues系列，因此在这里没有列出。</li>
    </ul>
</div>
            </div>
        `,
        速联SRAM: `
            <div class="brand-content">
                <h3>速联SRAM</h3>
                <p>这里是速联SRAM的详细内容。</p>
                <!-- 在这里添加更多内容 -->
            </div>
        `,
        Campagnolo: `
            <div class="brand-content">
                <h3>Campagnolo</h3>
                <p>这里是Campagnolo(CP)的详细内容。</p>
                <!-- 在这里添加更多内容 -->
            </div>
        `
    };

    return brandContents[brandId] || '<p>未找到相关内容。</p>';
}

function loadCSV(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(csvData => {
            const rows = csvData.split('\n');
            const headers = rows[0].split(',');
            const data = rows.slice(1).map(row => row.split(','));

            let html = '<table>';
            html += '<tr>';
            headers.forEach(header => {
                html += `<th>${header}</th>`;
            });
            html += '</tr>';
            data.forEach(row => {
                html += '<tr>';
                row.forEach(cell => {
                    html += `<td>${cell}</td>`;
                });
                html += '</tr>';
            });
            html += '</table>';

            document.getElementById('table-container').innerHTML = html;
        })
        .catch(error => {
            console.error('加载 CSV 文件失败:', error);
        });
}

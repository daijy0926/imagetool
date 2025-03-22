// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadSection = document.getElementById('downloadSection');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片文件
let currentFile = null;

// 初始化事件监听
function initEventListeners() {
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => fileInput.click());

    // 监听文件选择
    fileInput.addEventListener('change', handleFileSelect);

    // 监听拖拽事件
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);

    // 监听压缩质量变化
    qualitySlider.addEventListener('input', handleQualityChange);

    // 监听下载按钮点击
    downloadBtn.addEventListener('click', handleDownload);
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImage(file);
    }
}

// 处理拖拽
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.style.borderColor = '#0071e3';
    uploadArea.style.background = '#f5f5f7';
}

// 处理文件放下
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.style.borderColor = '#e5e5e5';
    uploadArea.style.background = 'white';

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
}

// 处理图片文件
function processImage(file) {
    currentFile = file;
    
    // 显示原始图片
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            previewContainer.style.display = 'grid';
            downloadSection.style.display = 'block';
            
            // 添加超时处理
            const compressionTimeout = setTimeout(() => {
                throw new Error('图片压缩超时');
            }, 30000); // 30秒超时
            
            compressImage(e.target.result, qualitySlider.value / 100)
                .then(() => {
                    clearTimeout(compressionTimeout);
                })
                .catch(error => {
                    console.error('压缩过程出错:', error);
                    alert('图片压缩失败，请重试或选择其他图片');
                });
        } catch (error) {
            console.error('处理图片时出错:', error);
            alert('处理图片时出错，请重试');
        }
    };
    
    reader.onerror = (error) => {
        console.error('读取文件时出错:', error);
        alert('读取文件失败，请重试');
    };
    
    reader.readAsDataURL(file);
}

// 压缩图片
async function compressImage(dataUrl, quality) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 设置画布尺寸
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // 绘制图片
                    ctx.drawImage(img, 0, 0);

                    // 压缩图片
                    const compressedDataUrl = canvas.toDataURL(currentFile.type, quality);
                    compressedImage.src = compressedDataUrl;

                    // 计算压缩后的大小
                    const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
                    document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = (error) => {
                reject(error);
            };

            img.src = dataUrl;
        } catch (error) {
            reject(error);
        }
    });
}

// 处理压缩质量变化
async function handleQualityChange(event) {
    try {
        const quality = event.target.value;
        qualityValue.textContent = quality + '%';
        if (currentFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    await compressImage(e.target.result, quality / 100);
                } catch (error) {
                    console.error('调整压缩质量时出错:', error);
                    alert('调整压缩质量失败，请重试');
                }
            };
            reader.onerror = (error) => {
                console.error('读取文件时出错:', error);
                alert('读取文件失败，请重试');
            };
            reader.readAsDataURL(currentFile);
        }
    } catch (error) {
        console.error('处理质量变化时出错:', error);
        alert('处理失败，请重试');
    }
}

// 处理图片下载
function handleDownload() {
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedImage.src;
    link.click();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化应用
initEventListeners(); 
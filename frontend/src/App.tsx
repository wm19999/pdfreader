import { notification } from 'antd';
import React, { useState, useEffect, useCallback  } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Row,
  Col,
  Card,
  Input,
  Tooltip,
  Typography,
  Button,
  Space,
  InputNumber,
} from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RedoOutlined,
  UndoOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

import usePdfreader from './store/usePdfreader';

// ====== 指定 Worker 路径 ======
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// ====== 必要的样式导入 (文字层 / 注释层) ======
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

const { Text } = Typography;
const { TextArea } = Input;

/** 信息条目展示组件 */
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div style={{ marginBottom: 8 }}>
    <Text strong>{label}:</Text>
    <Tooltip title={value}>
      <Text style={{ marginLeft: 8 }}>{value}</Text>
    </Tooltip>
  </div>
);

/** 判断是否是纯英文（含空格），这里示例用 */
const isEnglish = (text: string) => {
  return /^[A-Za-z\s]+$/.test(text);
};

/** 简易翻译示例 */
const mockTranslateToChinese = (text: string) => {
  return `（示例翻译）${text.split('').reverse().join('')}`;
};

function YzsPDFViewer() {
  // ====== 从 Zustand 中获取状态 ======
  const {
    filename,
    doi,
    sha,
    fileUrl,
    extractedText,
    currentPage,
    numPages,
    scale,
    fileHandle,
    saveFileInfo,
    setNumPages,
    setCurrentPage,
    setScale,
    setFileHandle,
  } = usePdfreader();

  // ====== 本地状态 ======
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [AnalysizeText, setAnalysizeText] = useState("");
  // ====== 文件打开处理 ======
  const handleFileOpen = async () => {
    try {
      // 使用 File System Access API 打开文件
      setCurrentPage(1);
      setNumPages(0); // 重置为未加载状态
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'PDF Files', accept: { 'application/pdf': ['.pdf'] } }],
      });

      // 把句柄存到 Zustand
      setFileHandle(handle);

      // 读取文件内容
      const file = await handle.getFile();


      // 计算 SHA256
      const v_sha = await computeSha256(file);

      // 提取文本
      const text = await extractTextFromPDF(file);

      // 提取 DOI
      const doiVal = extractDOIFromText(text);

      // 生成文件 URL
      const newFileUrl = URL.createObjectURL(file);

      // 存到 Zustand
      saveFileInfo(file.name, doiVal, v_sha, text, newFileUrl);

      // 设置 PDF 数据
      setPdfData(newFileUrl);

      // 重置状态
      setCurrentPage(1);
      setSelectedText('');
      setTranslatedText('');
      setAnalysizeText('');
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  // ====== 重新打开文件（如果已有 fileHandle） ======
  const reopenFile = useCallback(async () => {
    if (fileHandle) {
      try {
        const file = await fileHandle.getFile();
        const url = URL.createObjectURL(file);
        setPdfData(url);
      } catch (error) {
        console.error('Error reopening file:', error);
      }
    }
  }, [fileHandle]);

  // 当组件挂载且有 fileHandle，但 pdfData 为空时，尝试 reopen
  useEffect(() => {
    if (!pdfData && fileHandle) {
      reopenFile();
    }
  }, [pdfData, fileHandle, reopenFile]);
  // ====== SHA256 计算 ======
  async function computeSha256(file) {
    const arrayBuffer = await file.arrayBuffer();
    // 计算摘要
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    // 转换为16进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  const [analysisResult, setAnalysisResult] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ====== 发送消息到后端 ======
  const [editableText, setEditableText] = useState(selectedText);

  useEffect(() => {
    setEditableText(selectedText);
  }, [selectedText]);

  const sendTranslateMessage = async () => {
    if (!selectedText.trim()) {
      setTranslatedText("请输入内容后提交！");
      return;
    }


    setTranslatedText(""); // 先清空旧消息
  try {
    const response = await fetch("http://127.0.0.1:5000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText,label: "translate"  }),
    });

    if (!response.body) {
      throw new Error("流式数据为空");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setTranslatedText((prev) => prev + decoder.decode(value, { stream: true })); // 逐步更新内容
    }
  } catch (error) {
    console.error("请求失败:", error);
    setTranslatedText("请求失败，请检查后端是否运行！");
  }
};

const sendAnalylizelateMessage = async () => {
  if (!selectedText.trim()) {
    setAnalysizeText("请输入内容后提交！");
    return;
  }


  setAnalysizeText(""); // 先清空旧消息
try {
  const response = await fetch("http://127.0.0.1:5000/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: selectedText,label: "Analysis"  }),
  });

  if (!response.body) {
    throw new Error("流式数据为空");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    setAnalysizeText((prev) => prev + decoder.decode(value, { stream: true })); // 逐步更新内容
  }
} catch (error) {
  console.error("请求失败:", error);
  setAnalysizeText("请求失败，请检查后端是否运行！");
}
};

  // ====== PDF 文本提取 ======
  const extractTextFromPDF = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let pageIndex = 1; pageIndex <= pdfDoc.numPages; pageIndex++) {
        const page = await pdfDoc.getPage(pageIndex);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => (item as any).str || '').join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  }, []);

  // ====== 提取 DOI ======
  const extractDOIFromText = (text: string) => {
    const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;
    const matches = text.match(doiRegex);
    return matches ? matches[0] : '未找到 DOI';
  };


  // ====== 视图操作 ======
  const zoomIn = () => setScale(scale + 0.7);
  const zoomOut = () => setScale(Math.max(scale - 0.25, 0.25));
  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

  // ====== 多页翻页功能 ======
  const goPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  };
  const jumpToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
  };

  // ====== 文本选择后翻译 ======
  const handleMouseUp = () => {
    const selected = window.getSelection()?.toString()?.trim();
    if (selected) {
      setSelectedText(selected);
      setTranslatedText(isEnglish(selected) ? mockTranslateToChinese(selected) : '');
    }
  };

  // ====== PDF 加载成功回调 ======
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    console.log(`PDF 加载成功，共 ${numPages} 页。`);
  };

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
      <Col xs={24}  md={14}>
          <h4>PDF 即时阅读器 (React + react-pdf)</h4>
          <Button onClick={handleFileOpen}>打开 PDF 文件</Button>
        </Col>
        <Col xs={24} md={12}>
          {(sha || doi || filename) && <h4>文件信息</h4>}
          {filename && <InfoItem label="文件名" value={filename} />}
          {doi && <InfoItem label="提取的 DOI" value={doi} />}
          {sha && <InfoItem label="文档的 SHA" value={sha} />}
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        {/* 左栏：PDF 显示 */}
        <Col xs={24} sm={18} md={8} lg={9}>
          {pdfData && (
            <div style={{ border: '1px solid #ccc', padding: 10 }} onMouseUp={handleMouseUp}>
              {/* 工具栏区域 */}
              <div style={{ marginBottom: 8 }}>
                <Space wrap>
                  <Button onClick={zoomOut} icon={<ZoomOutOutlined />}>
                    缩小
                  </Button>
                  <span style={{ fontWeight: 'bold' }}>
                    {typeof scale === 'number' ? Math.round(scale * 100) : 100}%
                  </span>
                  <Button onClick={zoomIn} icon={<ZoomInOutlined />}>
                    放大
                  </Button>
                  <Button onClick={rotateLeft} icon={<UndoOutlined />}>
                    左转90°
                  </Button>
                  <Button onClick={rotateRight} icon={<RedoOutlined />}>
                    右转90°
                  </Button>
                </Space>
              </div>

              {/* PDF 文档显示 */}
              <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                  pageNumber={Math.min(Math.max(currentPage, 1), numPages || 1)}
                  scale={scale}
                  rotate={rotation}
                />
              </Document>

              {/* 翻页导航 */}
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={goPrevPage}
                  disabled={currentPage <= 1}
                  icon={<ArrowLeftOutlined />}
                >
                  上一页
                </Button>
                <span style={{ margin: '0 16px' }}>
                  当前第 {currentPage} / {numPages} 页
                </span>
                <Button
                  onClick={goNextPage}
                  disabled={currentPage >= numPages}
                  icon={<ArrowRightOutlined />}
                >
                  下一页
                </Button>
                <div style={{ marginLeft: 16 }}>
                  跳至:
                  <InputNumber
                    min={1}
                    max={numPages}
                    style={{ width: 70, marginLeft: 8 }}
                    value={currentPage}
                    onChange={jumpToPage}
                  />
                </div>
              </div>
            </div>
          )}
        </Col>

        {/* 中间：选中文本 & 翻译 & 编辑 & 发送 */}
        <Col xs={24} sm={12} md={6} lg={6}>
          <Card title="已选中的文本" style={{ marginBottom: 50 }}>
            <TextArea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              autoSize={{ minRows: 15, maxRows: 100 }}
            />
                        <div style={{ marginTop: 90, textAlign: 'right' }}>
              <Button 
                type="primary"
                onClick={() => sendTranslateMessage({
                  filename,
                  doi,
                  sha,
                  selectedText: editableText, // 发送修改后的文本
                  translatedText: isEnglish(editableText) ? translatedText : '无有效翻译'
                })}
                disabled={!editableText}
              >
                翻译
              </Button>
            </div>
          </Card>

          <Card title="翻译结果" style={{ width: '100%', height: '50%' }}>
            <div style={{ minHeight: 300 }}>
              
              {/* {selectedText && isEnglish(selectedText) ? ( */}
              
              {selectedText && selectedText ? (
                translatedText || <Text type="secondary">翻译中...</Text>
              ) : (
                <Text type="secondary">非英文或无翻译</Text>
              )}
            </div>



          </Card>
        </Col>

        {/* 右栏：选中文本 & 分析 & 编辑 & 发送 */}
        <Col xs={24} sm={12} md={6} lg={6}>
        <Card title="已选中的文本" style={{ marginBottom: 50, width: '120%', height: '52%' }}>
            <TextArea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              autoSize={{ minRows: 15, maxRows: 100 }}
            />
                        <div style={{ marginTop: 90, textAlign: 'right' }}>
              <Button 
                type="primary"
                onClick={() => sendAnalylizelateMessage({
                  filename,
                  doi,
                  sha,
                  selectedText: editableText, // 发送修改后的文本
                })}
                disabled={!editableText}
              >
                发送至AI分析
              </Button>
            </div>
          </Card>
        <Card title="分析结果" style={{ width: '120%', height: '50%',margin: 20, padding: 20, minHeight: "auto" }}>
            <div style={{ minHeight: 300  }}>
              {/* {selectedText && isEnglish(selectedText) ? ( */}
              
              {selectedText && selectedText ? (
                AnalysizeText || <Text type="secondary">分析中...</Text>
              ) : (
                <Text type="secondary">等待输入</Text>
              )}
            </div>

            {/* 发送按钮区域 */}

          </Card>
      </Col>
      </Row>

      {/* 下方：显示提取的文本（如需） */}
      {extractedText && (
        <Card title="提取的Pdf全文内容" style={{ marginTop: 20 }}>
          <TextArea
            value={extractedText}
            autoSize={{ minRows: 6, maxRows: 10 }}
            readOnly
            style={{ background: '#f5f5f5' }}
          />
        </Card>
      )}
    </div>
  );
}

export default YzsPDFViewer;

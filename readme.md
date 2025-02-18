# PDFReader

## 📌 项目介绍
PDFReader 是一个基于 **Python 后端 + Vite 前端** 的 PDF 文本提取和翻译工具。用户可以上传 PDF 文件，系统会自动解析文本，并支持文本翻译与编辑。

### ✨ 主要功能
- **PDF 解析**：提取 PDF 内文本内容
- **文本翻译**：支持自动翻译文本
- **文本编辑**：用户可手动调整解析和翻译的结果
- **前后端分离**：后端使用 Python（Poetry 依赖管理），前端使用 Vite + pnpm

---

## 🚀 如何运行？

### **1️⃣ 克隆 GitHub 仓库**
```sh
git clone https://github.com/yourusername/PDFREADER.git
cd PDFREADER
```

### **2️⃣ 安装后端（Python）依赖**
```sh
cd backend
poetry install  # 安装 Python 依赖
```

如果 `.env` 文件未提供，需要手动创建：
```sh
cp .env.example .env
```

### **3️⃣ 运行后端**
```sh
poetry run python app.py
```
或者：
```sh
poetry shell  # 进入 Poetry 虚拟环境
python app.py
```

---

### **4️⃣ 安装前端（pnpm）依赖**
```sh
cd ../frontend
pnpm install  # 安装前端依赖
```

### **5️⃣ 运行前端**
```sh
pnpm run dev
```

然后在浏览器中打开 `http://localhost:5173`（Vite 默认端口）。

---

## 📂 项目结构
```
PDFREADER/
├── backend/         # 后端（Python + Poetry）
│   ├── app.py       # 后端主程序
│   ├── .env         # 环境变量（未提供时需创建）
│   ├── pyproject.toml  # Poetry 配置文件
│   ├── poetry.lock  # Poetry 依赖锁定文件
│   ├── ...
│
├── frontend/        # 前端（Vite + pnpm）
│   ├── src/         # 前端源码
│   ├── public/      # 静态资源
│   ├── package.json # 前端依赖
│   ├── pnpm-lock.yaml  # pnpm 依赖锁定文件
│   ├── vite.config.js  # Vite 配置
│   ├── ...
│
├── README.md        # 项目文档
├── .gitignore       # Git 忽略规则
```

---

## ✅ 注意事项
1. **Python 版本要求**：建议使用 Python 3.8+。
2. **Node.js 版本要求**：建议使用 Node.js 16+ 以确保 `pnpm` 正常运行。
3. **如果 `pnpm` 未安装**，请先安装 `pnpm`：
   ```sh
   npm install -g pnpm
   ```
4. **数据库（如果有）**：
   - 请确保 `.env` 文件正确配置，例如数据库连接地址。
   - 如果使用 SQLite，确保 `backend/` 目录下有正确的数据库文件。

---

## 📜 许可证
本项目遵循 MIT 许可证。


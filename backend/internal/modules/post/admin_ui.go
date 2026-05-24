package post

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const adminPublishHTML = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Publish Post — My Journal</title>
	<style>
		:root {
			--bg: #0a0a0a;
			--surface: #141414;
			--surface-hover: #1a1a1a;
			--border: #262626;
			--text: #e5e5e5;
			--text-secondary: #a3a3a3;
			--accent: #8b5cf6;
			--accent-hover: #7c3aed;
			--success: #22c55e;
			--error: #ef4444;
			--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
			--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		}
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: var(--font-sans);
			background: var(--bg);
			color: var(--text);
			min-height: 100vh;
			display: flex;
			justify-content: center;
			align-items: flex-start;
			padding: 48px 16px;
		}
		.container {
			width: 100%;
			max-width: 640px;
		}
		header {
			margin-bottom: 32px;
		}
		header h1 {
			font-size: 20px;
			font-weight: 600;
			letter-spacing: -0.02em;
			margin-bottom: 4px;
		}
		header p {
			color: var(--text-secondary);
			font-size: 14px;
		}
		.card {
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: 12px;
			padding: 24px;
			margin-bottom: 16px;
		}
		.label {
			display: block;
			font-size: 12px;
			font-weight: 500;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--text-secondary);
			margin-bottom: 8px;
		}
		.dropzone {
			border: 2px dashed var(--border);
			border-radius: 8px;
			padding: 48px 24px;
			text-align: center;
			cursor: pointer;
			transition: all 0.15s ease;
			position: relative;
		}
		.dropzone:hover, .dropzone.dragover {
			border-color: var(--accent);
			background: rgba(139, 92, 246, 0.05);
		}
		.dropzone .icon {
			font-size: 32px;
			margin-bottom: 12px;
			opacity: 0.5;
		}
		.dropzone .title {
			font-size: 14px;
			font-weight: 500;
			margin-bottom: 4px;
		}
		.dropzone .hint {
			font-size: 12px;
			color: var(--text-secondary);
		}
		.dropzone input[type="file"] {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			opacity: 0;
			cursor: pointer;
		}
		.file-info {
			background: var(--surface-hover);
			border: 1px solid var(--border);
			border-radius: 6px;
			padding: 12px 16px;
			margin-top: 12px;
			display: none;
			align-items: center;
			gap: 12px;
		}
		.file-info.visible { display: flex; }
		.file-info .file-icon {
			font-size: 20px;
		}
		.file-info .file-meta {
			flex: 1;
			min-width: 0;
		}
		.file-info .file-name {
			font-size: 14px;
			font-weight: 500;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.file-info .file-size {
			font-size: 12px;
			color: var(--text-secondary);
			font-family: var(--font-mono);
		}
		.file-info .remove-btn {
			background: none;
			border: none;
			color: var(--text-secondary);
			cursor: pointer;
			font-size: 18px;
			padding: 4px;
			line-height: 1;
		}
		.file-info .remove-btn:hover {
			color: var(--error);
		}
		input[type="text"], input[type="password"], input[type="datetime-local"] {
			width: 100%;
			background: var(--bg);
			border: 1px solid var(--border);
			border-radius: 6px;
			padding: 10px 12px;
			color: var(--text);
			font-size: 14px;
			font-family: var(--font-sans);
			outline: none;
			transition: border-color 0.15s ease;
		}
		input[type="text"]:focus, input[type="password"]:focus, input[type="datetime-local"]:focus {
			border-color: var(--accent);
		}
		input[type="datetime-local"]::-webkit-calendar-picker-indicator {
			filter: invert(0.7);
			cursor: pointer;
		}
		.hint-text {
			font-size: 12px;
			color: var(--text-secondary);
			margin-top: 6px;
		}
		.btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			width: 100%;
			padding: 12px;
			background: var(--accent);
			color: white;
			border: none;
			border-radius: 8px;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: background 0.15s ease;
			font-family: var(--font-sans);
		}
		.btn:hover:not(:disabled) {
			background: var(--accent-hover);
		}
		.btn:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		.btn .spinner {
			width: 16px;
			height: 16px;
			border: 2px solid rgba(255,255,255,0.3);
			border-top-color: white;
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
			display: none;
		}
		.btn.loading .spinner { display: inline-block; }
		.btn.loading .btn-text { opacity: 0.8; }
		@keyframes spin { to { transform: rotate(360deg); } }
		.alert {
			border-radius: 8px;
			padding: 12px 16px;
			font-size: 13px;
			margin-bottom: 16px;
			display: none;
			align-items: flex-start;
			gap: 8px;
		}
		.alert.visible { display: flex; }
		.alert.success {
			background: rgba(34, 197, 94, 0.1);
			border: 1px solid rgba(34, 197, 94, 0.2);
			color: var(--success);
		}
		.alert.error {
			background: rgba(239, 68, 68, 0.1);
			border: 1px solid rgba(239, 68, 68, 0.2);
			color: var(--error);
		}
		.alert pre {
			font-family: var(--font-mono);
			font-size: 12px;
			white-space: pre-wrap;
			word-break: break-word;
			margin-top: 4px;
		}
		.preview {
			background: var(--bg);
			border: 1px solid var(--border);
			border-radius: 6px;
			padding: 16px;
			margin-top: 12px;
			display: none;
		}
		.preview.visible { display: block; }
		.preview h3 {
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--text-secondary);
			margin-bottom: 8px;
		}
		.preview .field {
			display: flex;
			gap: 8px;
			margin-bottom: 4px;
			font-size: 13px;
		}
		.preview .field-label {
			color: var(--text-secondary);
			min-width: 80px;
			font-family: var(--font-mono);
			font-size: 12px;
		}
		.preview .field-value {
			color: var(--text);
		}
		.footer {
			text-align: center;
			color: var(--text-secondary);
			font-size: 12px;
			margin-top: 24px;
		}
	</style>
</head>
<body>
	<div class="container">
		<header>
			<h1>📄 Publish Post</h1>
			<p>Upload an MDX file with YAML frontmatter to publish.</p>
		</header>

		<div id="alert" class="alert">
			<span id="alert-icon">✓</span>
			<div>
				<div id="alert-title" style="font-weight:500;margin-bottom:2px;"></div>
				<pre id="alert-body"></pre>
			</div>
		</div>

		<div class="card">
			<label class="label">MDX File</label>
			<div class="dropzone" id="dropzone">
				<input type="file" id="fileInput" accept=".mdx,.md" />
				<div class="icon">⬆️</div>
				<div class="title">Drag & drop your MDX file here</div>
				<div class="hint">or click to browse — accepts .mdx and .md</div>
			</div>
			<div class="file-info" id="fileInfo">
				<span class="file-icon">📄</span>
				<div class="file-meta">
					<div class="file-name" id="fileName"></div>
					<div class="file-size" id="fileSize"></div>
				</div>
				<button type="button" class="remove-btn" id="removeBtn" title="Remove file">×</button>
			</div>
			<div class="preview" id="preview">
				<h3>Frontmatter Preview</h3>
				<div id="previewContent"></div>
			</div>
		</div>

		<div class="card">
			<label class="label" for="publishDate">Publish Date (optional)</label>
			<input type="datetime-local" id="publishDate" />
			<div class="hint-text">Override the frontmatter date. Leave empty to use frontmatter or draft.</div>
		</div>

		<div class="card">
			<label class="label" for="adminKey">Admin API Key</label>
			<input type="password" id="adminKey" placeholder="Enter your admin API key" autocomplete="off" />
			<div class="hint-text">This is sent in the X-Admin-Key header.</div>
		</div>

		<button class="btn" id="publishBtn" disabled>
			<span class="spinner"></span>
			<span class="btn-text">Publish Post</span>
		</button>

		<div class="footer">
			My Journal Admin · POST /api/v1/admin/posts/mdx
		</div>
	</div>

	<script>
		const dropzone = document.getElementById('dropzone');
		const fileInput = document.getElementById('fileInput');
		const fileInfo = document.getElementById('fileInfo');
		const fileName = document.getElementById('fileName');
		const fileSize = document.getElementById('fileSize');
		const removeBtn = document.getElementById('removeBtn');
		const preview = document.getElementById('preview');
		const previewContent = document.getElementById('previewContent');
		const adminKey = document.getElementById('adminKey');
		const publishBtn = document.getElementById('publishBtn');
		const alertBox = document.getElementById('alert');
		const alertTitle = document.getElementById('alert-title');
		const alertBody = document.getElementById('alert-body');
		const alertIcon = document.getElementById('alert-icon');

		let currentFile = null;
		let fileContent = '';

		function formatBytes(bytes) {
			if (bytes === 0) return '0 B';
			const k = 1024;
			const sizes = ['B', 'KB', 'MB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
		}

		function showAlert(type, title, body) {
			alertBox.className = 'alert visible ' + type;
			alertIcon.textContent = type === 'success' ? '✓' : '✕';
			alertTitle.textContent = title;
			alertBody.textContent = body || '';
		}

		function hideAlert() {
			alertBox.classList.remove('visible');
		}

		function parseFrontmatter(text) {
			const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
			if (!match) return null;
			const lines = match[1].split('\n');
			const meta = {};
			for (const line of lines) {
				const idx = line.indexOf(':');
				if (idx > 0) {
					const key = line.slice(0, idx).trim();
					let val = line.slice(idx + 1).trim();
					if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
					if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
					if (val.startsWith('[') && val.endsWith(']')) {
						val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
					}
					meta[key] = val;
				}
			}
			return meta;
		}

		function updatePreview() {
			if (!fileContent) {
				preview.classList.remove('visible');
				return;
			}
			const meta = parseFrontmatter(fileContent);
			if (!meta) {
				preview.classList.remove('visible');
				return;
			}
			const fields = [
				{ label: 'title', key: 'title' },
				{ label: 'slug', key: 'slug' },
				{ label: 'desc', key: 'description' },
				{ label: 'categories', key: 'categories' },
				{ label: 'tags', key: 'tags' },
				{ label: 'featured', key: 'featured' },
			];
			let html = '';
			for (const f of fields) {
				const val = meta[f.key];
				if (val !== undefined && val !== '') {
					const display = Array.isArray(val) ? val.join(', ') : String(val);
					html += '<div class="field"><span class="field-label">' + f.label + '</span><span class="field-value">' + display + '</span></div>';
				}
			}
			previewContent.innerHTML = html;
			preview.classList.add('visible');
		}

		function handleFile(file) {
			if (!file) return;
			if (!file.name.endsWith('.mdx') && !file.name.endsWith('.md')) {
				showAlert('error', 'Invalid file', 'Only .mdx and .md files are accepted.');
				return;
			}
			currentFile = file;
			fileName.textContent = file.name;
			fileSize.textContent = formatBytes(file.size);
			fileInfo.classList.add('visible');
			publishBtn.disabled = !adminKey.value;
			const reader = new FileReader();
			reader.onload = (e) => {
				fileContent = e.target.result;
				updatePreview();
			};
			reader.readAsText(file);
		}

		['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
			dropzone.addEventListener(eventName, (e) => {
				e.preventDefault();
				e.stopPropagation();
			}, false);
		});

		['dragenter', 'dragover'].forEach(eventName => {
			dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
		});

		['dragleave', 'drop'].forEach(eventName => {
			dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
		});

		dropzone.addEventListener('drop', (e) => {
			const files = e.dataTransfer.files;
			if (files.length) handleFile(files[0]);
		}, false);

		fileInput.addEventListener('change', (e) => {
			if (e.target.files.length) handleFile(e.target.files[0]);
		});

		removeBtn.addEventListener('click', () => {
			currentFile = null;
			fileContent = '';
			fileInfo.classList.remove('visible');
			preview.classList.remove('visible');
			fileInput.value = '';
			publishBtn.disabled = true;
		});

		adminKey.addEventListener('input', () => {
			publishBtn.disabled = !(currentFile && adminKey.value);
		});

		publishBtn.addEventListener('click', async () => {
			if (!currentFile || !fileContent || !adminKey.value) return;
			hideAlert();
			publishBtn.classList.add('loading');
			publishBtn.disabled = true;

			const meta = parseFrontmatter(fileContent);
			let content = fileContent;

			// Override published_at in frontmatter if date is set
			const dateVal = document.getElementById('publishDate').value;
			if (dateVal && meta) {
				const iso = new Date(dateVal).toISOString();
				content = fileContent.replace(
					/(published_at:\s*)(["']?)[^\n\r]*\2/,
					'$1$2' + iso + '$2'
				);
			}

			try {
				const res = await fetch('/api/v1/admin/posts/mdx', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Admin-Key': adminKey.value,
					},
					body: JSON.stringify({
						content: content,
						publish: !!dateVal || (meta && meta.published_at && meta.published_at !== ''),
					}),
				});

				const data = await res.json();

				if (res.ok) {
					let body = 'Post published successfully.';
					if (data.warning) body += '\nWarning: ' + data.warning;
					if (data.post) body = 'Slug: ' + (data.post.slug || data.post.Slug || 'N/A') + '\nTitle: ' + (data.post.title || data.post.Title || 'N/A');
					showAlert('success', 'Published!', body);
					// Clear file after success
					currentFile = null;
					fileContent = '';
					fileInfo.classList.remove('visible');
					preview.classList.remove('visible');
					fileInput.value = '';
					publishBtn.disabled = true;
				} else {
					showAlert('error', 'Publish failed', data.error || 'Unknown error (HTTP ' + res.status + ')');
				}
			} catch (err) {
				showAlert('error', 'Network error', err.message);
			} finally {
				publishBtn.classList.remove('loading');
				publishBtn.disabled = !(currentFile && adminKey.value);
			}
		});
	</script>
</body>
</html>`

// AdminPublishPage serves the HTML admin publish UI.
func (h *AdminHandler) AdminPublishPage(c *gin.Context) {
	c.Header("Content-Type", "text/html; charset=utf-8")
	c.String(http.StatusOK, adminPublishHTML)
}

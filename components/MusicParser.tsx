"use client";

import { useState } from "react";
import {
  Music,
  Download,
  Link2,
  Loader2,
  FileAudio,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Play,
  Pause,
} from "lucide-react";

interface AudioResult {
  success: boolean;
  originalUrl: string;
  mixsongid?: string;
  title?: string;
  artist?: string;
  cover?: string;
  description?: string;
  audioUrls: string[];
  audioCount: number;
  error?: string;
}

export default function MusicParser() {
  const [url, setUrl] = useState("https://t.tencentmusic.com/v/Hm-59MLZxmvr");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioResult | null>(null);
  const [error, setError] = useState("");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleParse = async () => {
    if (!url.trim()) {
      setError("请输入分享链接");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.error || "解析失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络请求失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (audioUrl: string, index: number) => {
    const filename = `${result?.title || "music"}_${index + 1}.mp3`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(audioUrl)}&filename=${encodeURIComponent(filename)}`;
    window.open(proxyUrl, "_blank");
  };

  const handleCopyUrl = (audioUrl: string, index: number) => {
    navigator.clipboard.writeText(audioUrl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const togglePlay = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
    } else {
      setPlayingIndex(index);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          酷狗Vemus音乐解析下载器
        </h1>
        <p className="text-gray-500">
          粘贴腾讯音乐/酷狗Vemus分享链接，一键提取 MP3 音频
        </p>
      </div>

      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          分享链接
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://t.tencentmusic.com/v/..."
              className="input-field pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleParse()}
            />
          </div>
          <button
            onClick={handleParse}
            disabled={loading}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                <FileAudio className="w-4 h-4" />
                解析
              </>
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">示例:</span>
          <button
            onClick={() =>
              setUrl("https://t.tencentmusic.com/v/Hm-59MLZxmvr")
            }
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            酷狗分享链接
          </button>
        </div>
      </div>

      {error && (
        <div className="card mb-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">解析失败</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <p className="text-xs text-red-500 mt-2">
                提示：部分链接可能需要登录或有地区限制，请确保链接可正常访问。
              </p>
            </div>
          </div>
        </div>
      )}

      {result?.success && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                {result.cover ? (
                  <img
                    src={result.cover}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {result.title || "未知歌曲"}
                </h2>
                {result.artist && (
                  <p className="text-sm text-gray-500 mt-1">{result.artist}</p>
                )}
                {result.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {result.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    找到 {result.audioCount} 个音频
                  </span>
                  {result.mixsongid && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      ID: {result.mixsongid}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {result.audioUrls.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FileAudio className="w-4 h-4" />
                音频资源列表
              </h3>

              <div className="space-y-3">
                {result.audioUrls.map((audioUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => togglePlay(index)}
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      {playingIndex === index ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        音频 {index + 1}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {audioUrl.length > 60
                          ? audioUrl.slice(0, 60) + "..."
                          : audioUrl}
                      </p>
                    </div>

                    {playingIndex === index && (
                      <audio
                        src={audioUrl}
                        autoPlay
                        controls
                        className="hidden"
                        onEnded={() => setPlayingIndex(null)}
                      />
                    )}

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopyUrl(audioUrl, index)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="复制链接"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(audioUrl, index)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="新窗口打开"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {result.audioUrls.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      result.audioUrls.forEach((url, i) => {
                        setTimeout(() => handleDownload(url, i), i * 500);
                      });
                    }}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    批量下载全部 ({result.audioUrls.length} 个)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-700">未找到音频资源</h3>
              <p className="text-sm text-gray-500 mt-1">
                该页面可能没有直接暴露的音频文件，或需要登录才能访问。
              </p>
              <a
                href={result.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-3"
              >
                <ExternalLink className="w-3 h-3" />
                在浏览器中打开原页面
              </a>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-center text-xs text-gray-400">
        <p>仅供学习研究使用，请遵守相关版权法律法规</p>
        <p className="mt-1">支持解析：腾讯音乐短链、酷狗Vemus音乐分享页</p>
      </div>
    </div>
  );
}

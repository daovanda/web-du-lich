// lib/exportMapImage.ts
import html2canvas from 'html2canvas';
import { categorizeProvinces } from './provinceConfig';

interface ExportMapOptions {
  visitedCount: number;
  total: number;
  visitedProvinces: string[];
  userName?: string;
  userAvatar?: string;
}

/**
 * Export map as image with progress overlay
 * Aspect ratio: 9:16 (vertical/portrait for stories)
 */
export async function exportMapImage({
  visitedCount,
  total,
  visitedProvinces,
  userName = "Du khách",
  userAvatar,
}: ExportMapOptions): Promise<void> {
  try {
    const stats = categorizeProvinces(visitedProvinces);
    const percent = ((visitedCount / total) * 100).toFixed(1);
    const achievement = getAchievementBadge(visitedCount, total);
    
    // Create container for export
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = '1080px';
    exportContainer.style.height = '1920px';
    exportContainer.style.background = '#000000';
    exportContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    
    document.body.appendChild(exportContainer);

    // ✅ Avatar fallback
    const avatarUrl = userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=200&background=10b981&color=fff&bold=true`;
    
    // Build HTML content
    exportContainer.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        display: flex;
        flex-direction: column;
        padding: 60px;
        box-sizing: border-box;
      ">
        
        <!-- ✅ User Header with Avatar -->
        <div style="
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding: 24px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
        ">
          <!-- Avatar -->
          <div style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 4px;
            flex-shrink: 0;
          ">
            <div style="
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background-image: url('${avatarUrl}');
              background-size: cover;
              background-position: center;
              border: 3px solid #0a0a0a;
            "></div>
          </div>
          
          <!-- User Info -->
          <div style="flex: 1; min-width: 0;">
            <h3 style="
              color: #f1f5f9;
              font-size: 32px;
              font-weight: 700;
              margin: 0 0 8px 0;
              letter-spacing: -0.5px;
            ">${userName}</h3>
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;
            ">
              <span style="
                color: white;
                padding: 6px 16px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
              ">${achievement.emoji} ${achievement.title}</span>
              <span style="
                color: #94a3b8;
                font-size: 18px;
                font-weight: 500;
              ">${percent}% Việt Nam</span>
            </div>
          </div>
        </div>

        <!-- ✅ Stats Grid - Mainland & Islands -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        ">
          <!-- Mainland Stats -->
          <div style="
            background: rgba(16, 185, 129, 0.08);
            border: 2px solid rgba(16, 185, 129, 0.3);
            border-radius: 20px;
            padding: 24px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;
            ">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span style="
                color: #10b981;
                font-size: 18px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">Tỉnh Thành</span>
            </div>
            <div style="
              font-size: 56px;
              font-weight: 900;
              color: #10b981;
              line-height: 1;
              margin-bottom: 8px;
            ">${stats.mainland.visited}<span style="font-size: 40px; color: #64748b;">/63</span></div>
            <div style="
              color: #94a3b8;
              font-size: 16px;
              font-weight: 600;
            ">${((stats.mainland.visited / stats.mainland.total) * 100).toFixed(1)}% đất liền</div>
          </div>

          <!-- Island Stats -->
          <div style="
            background: rgba(59, 130, 246, 0.08);
            border: 2px solid rgba(59, 130, 246, 0.3);
            border-radius: 20px;
            padding: 24px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;
            ">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5">
                <path d="M3 15.5c0-1.5.5-3 1.5-4s2-1.5 3.5-1.5 2.5.5 3.5 1.5 1.5 2.5 1.5 4-.5 3-1.5 4-2 1.5-3.5 1.5-2.5-.5-3.5-1.5S3 17 3 15.5z"/>
                <path d="M14 10c0-1 .5-2 1.25-2.75S17 6 18 6s2 .5 2.75 1.25S22 9 22 10s-.5 2-1.25 2.75S19 14 18 14s-2-.5-2.75-1.25S14 11 14 10z"/>
              </svg>
              <span style="
                color: #3b82f6;
                font-size: 18px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">Quần Đảo</span>
            </div>
            <div style="
              font-size: 56px;
              font-weight: 900;
              color: #3b82f6;
              line-height: 1;
              margin-bottom: 8px;
            ">${stats.islands.visited}<span style="font-size: 40px; color: #64748b;">/2</span></div>
            <div style="
              color: #94a3b8;
              font-size: 16px;
              font-weight: 600;
            ">${stats.islands.visited === 2 ? 'Hoàn thành' : stats.islands.visited === 1 ? '1 quần đảo còn lại' : 'Chưa khám phá'}</div>
          </div>
        </div>

        <!-- Map Container -->
        <div style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 24px;
          padding: 40px;
          border: 2px solid rgba(16, 185, 129, 0.15);
          position: relative;
          overflow: hidden;
        ">
          <!-- SVG will be injected here -->
          <div id="map-svg-container" style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          "></div>
        </div>

        <!-- Bottom Stats Row -->
        <div style="
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        ">
          <div style="
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
          ">
            <div style="
              font-size: 36px;
              font-weight: 800;
              color: #10b981;
              margin-bottom: 4px;
            ">${stats.overall.visited}</div>
            <div style="
              font-size: 14px;
              color: #94a3b8;
              font-weight: 600;
            ">Tổng đã ghé</div>
          </div>
          
          <div style="
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
          ">
            <div style="
              font-size: 36px;
              font-weight: 800;
              color: #ef4444;
              margin-bottom: 4px;
            ">${total - visitedCount}</div>
            <div style="
              font-size: 14px;
              color: #94a3b8;
              font-weight: 600;
            ">Chưa khám phá</div>
          </div>
          
          <div style="
            background: rgba(168, 85, 247, 0.1);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
          ">
            <div style="
              font-size: 36px;
              font-weight: 800;
              color: #a855f7;
              margin-bottom: 4px;
            ">${percent}%</div>
            <div style="
              font-size: 14px;
              color: #94a3b8;
              font-weight: 600;
            ">Hoàn thành</div>
          </div>
        </div>

        <!-- Watermark -->
        <div style="
          text-align: center;
          margin-top: 24px;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
        ">
          📍 Vietnam Travel Map • ${new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>
    `;

    // ✅ Clone and inject SVG map
    const originalSvg = document.querySelector('#vn-map-root svg');
    if (!originalSvg) {
      throw new Error('Map SVG not found');
    }

    const svgClone = originalSvg.cloneNode(true) as SVGElement;
    const mapContainer = exportContainer.querySelector('#map-svg-container');
    
    if (mapContainer) {
      svgClone.style.maxWidth = '100%';
      svgClone.style.maxHeight = '100%';
      svgClone.style.width = 'auto';
      svgClone.style.height = 'auto';
      
      const paths = svgClone.querySelectorAll('path');
      paths.forEach(path => {
        path.style.cursor = 'default';
        path.style.pointerEvents = 'none';
      });
      
      mapContainer.appendChild(svgClone);
    }

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 800));

    // ✅ Capture with html2canvas
    const canvas = await html2canvas(exportContainer, {
      backgroundColor: '#000000',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Clean up
    document.body.removeChild(exportContainer);

    // ✅ Download image
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `vietnam-travel-map-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    return Promise.resolve();
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

/**
 * Get achievement badge based on progress
 */
export function getAchievementBadge(visitedCount: number, total: number): {
  emoji: string;
  title: string;
  description: string;
} {
  const percent = (visitedCount / total) * 100;

  if (percent === 100) {
    return {
      emoji: '🏆',
      title: 'Bậc Thầy Khám Phá',
      description: 'Đã chinh phục toàn bộ 65 địa điểm!',
    };
  } else if (percent >= 80) {
    return {
      emoji: '⭐',
      title: 'Nhà Thám Hiểm',
      description: 'Sắp hoàn thành hành trình rồi!',
    };
  } else if (percent >= 50) {
    return {
      emoji: '🎯',
      title: 'Người Đi Nhiều',
      description: 'Đã đi hơn nửa Việt Nam!',
    };
  } else if (percent >= 25) {
    return {
      emoji: '🚀',
      title: 'Khám Phá Viên',
      description: 'Tiếp tục hành trình!',
    };
  } else {
    return {
      emoji: '🌱',
      title: 'Du Khách Mới',
      description: 'Bắt đầu phiêu lưu!',
    };
  }
}
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { Smartphone, TabletLandscape, Monitor } from '@phosphor-icons/react'

export function DeviceIndicator() {
  const device = useDeviceDetection()

  if (!device.isMobile && !device.isTablet) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/50 backdrop-blur-sm rounded-full p-2 border border-white/20">
      <div className="flex items-center gap-2 text-white/70 text-xs">
        {device.isMobile && !device.isTablet ? (
          <Smartphone size={16} />
        ) : device.isTablet ? (
          <TabletLandscape size={16} />
        ) : (
          <Monitor size={16} />
        )}
        
        <div className="flex items-center gap-1">
          {device.isIOS && <span>iOS</span>}
          {device.isAndroid && <span>Android</span>}
          {device.standalone && <span className="px-1 py-0.5 bg-accent/30 rounded text-[10px]">PWA</span>}
        </div>
      </div>
    </div>
  )
}
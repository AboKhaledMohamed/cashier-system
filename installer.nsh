; NSIS Installer Script - الكاشير الذكي
; Simplified version

; Post-installation message
Function .onInstSuccess
  MessageBox MB_OK "تم تثبيت البرنامج بنجاح!$
$
يمكنك الآن بدء استخدام الكاشير الذكي."
FunctionEnd

; Uninstall confirmation
Function un.onInit
  MessageBox MB_OKCANCEL "هل أنت متأكد من إلغاء تثبيت الكاشير الذكي؟" IDOK continue
  Abort
  continue:
FunctionEnd

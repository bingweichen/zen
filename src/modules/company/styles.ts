// 样式常量
export const COMPANY_PAGE_STYLES = {
  container: { padding: 24, maxWidth: 800, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { margin: 0 },
  emptyCard: { textAlign: 'center' as const, background: '#fafafa' },
  emptyIcon: { fontSize: 48, color: '#d9d9d9', marginBottom: 16 },
  emptyTitle: { color: '#8c8c8c' },
  companyIcon: { fontSize: 24, color: '#1890ff' },
  selectedButton: { color: '#52c41a' },
  errorAlert: { marginBottom: 16 }
} as const; 
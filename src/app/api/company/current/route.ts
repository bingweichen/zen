import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/shared/lib/utils';
import { getCurrentCompany, setCurrentCompany } from '@/modules/company/server';

// 获取当前选择的公司
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUser() as number;
  
  try {
    const result = await getCurrentCompany(userId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: '获取当前公司失败', detail: errorMsg }, { status: 500 });
  }
}

// 设置当前公司
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUser() as number;
  
  try {
    const body = await req.json();
    const { companyId } = body;
    
    if (!companyId) {
      return NextResponse.json({ error: '公司ID不能为空' }, { status: 400 });
    }

    const result = await setCurrentCompany(userId, parseInt(companyId));
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: '设置当前公司失败', detail: errorMsg }, { status: 500 });
  }
} 
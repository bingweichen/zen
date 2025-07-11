import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/shared/lib/utils';
import { 
  getUserCompanies, 
  createCompany, 
  updateCompany, 
  deleteCompany 
} from '@/server/company';

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUser() as number;
  
  try {
    const companies = await getUserCompanies(userId);
    return NextResponse.json(companies);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUser() as number;
  
  try {
    // 解析请求体，获取公司信息
    const body = await req.json();
    const { name, description, address, phone, email, website, taxNumber, businessLicense } = body;

    const company = await createCompany(userId, {
      name,
      description,
      address,
      phone,
      email,
      website,
      taxNumber,
      businessLicense
    });
    return NextResponse.json(company);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUser() as number;
  
  try {
    // 解析请求体
    const body = await req.json();
    const { id, name, description, address, phone, email, website, taxNumber, businessLicense } = body;

    const updatedCompany = await updateCompany(userId, {
      id,
      name,
      description,
      address,
      phone,
      email,
      website,
      taxNumber,
      businessLicense
    });
    return NextResponse.json(updatedCompany);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUser() as number;
  
  try {
    // 从URL参数获取公司ID
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '公司ID不能为空' }, { status: 400 });
    }

    const result = await deleteCompany(userId, id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
} 
'use server'

import { z } from 'zod'
import { insertInvoice, updateInvoice as updateDbInvoice, deleteInvoice as deleteDbInvoice } from './data'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string()
})

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true })
const UpdateInvoice = InvoiceSchema.omit({ date: true })

export async function createInvoice (formData: FormData): Promise<void> {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    customerId: customer_id,
    amount,
    status
  } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  await insertInvoice({
    customer_id,
    amount: amountInCents,
    status,
    date
  })
  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function updateInvoice (id: string, formData: FormData) {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    customerId: customer_id,
    amount,
    status
  } = UpdateInvoice.parse({
    id,
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })

  const amountInCents = amount * 100

  await updateDbInvoice({
    id,
    customer_id,
    amount: amountInCents,
    status
  })

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice (id: string) {
  await deleteDbInvoice(id)
  revalidatePath('/dashboard/invoices')
}
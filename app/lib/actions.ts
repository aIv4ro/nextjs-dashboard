'use server'

import { z } from 'zod'
import { insertInvoice, updateInvoice as updateDbInvoice, deleteInvoice as deleteDbInvoice } from './data'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// This is temporary until @types/react-dom is updated
export interface State {
  errors?: {
    customerId?: string[]
    amount?: string[]
    status?: string[]
  }
  message?: string | null
}

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.'
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.'
  }),
  date: z.string()
})

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true })
const UpdateInvoice = InvoiceSchema.omit({ date: true })

export async function createInvoice (_: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.'
    }
  }
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    customerId: customer_id,
    amount,
    status
  } = validatedFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  try {
    await insertInvoice({
      customer_id,
      amount: amountInCents,
      status,
      date
    })
    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.'
    }
  }
}

export async function updateInvoice (id: string, _: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    id,
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.'
    }
  }

  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    customerId: customer_id,
    amount,
    status
  } = validatedFields.data

  const amountInCents = amount * 100

  try {
    await updateDbInvoice({
      id,
      customer_id,
      amount: amountInCents,
      status
    })
    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' }
  }
}

export async function deleteInvoice (id: string) {
  try {
    await deleteDbInvoice(id)
    revalidatePath('/dashboard/invoices')
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' }
  }
}

import { createClient } from '@/utils/supabase/server'
import { ProductProject, ProductDocumentation } from '@/types'

export class ProductRepository {
    private static tableName = 'product_projects'

    static async getAll(): Promise<ProductProject[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching product projects:', error)
            return []
        }

        return data as ProductProject[]
    }

    static async getById(id: string): Promise<ProductProject | null> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error(`Error fetching product project ${id}:`, error)
            return null
        }

        return data as ProductProject
    }

    static async create(project: Partial<ProductProject>): Promise<ProductProject | null> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from(this.tableName)
            .insert(project)
            .select()
            .single()

        if (error) {
            console.error('Error creating product project:', error)
            return null
        }

        return data as ProductProject
    }

    static async update(id: string, project: Partial<ProductProject>): Promise<ProductProject | null> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ ...project, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error(`Error updating product project ${id}:`, error)
            return null
        }

        return data as ProductProject
    }

    static async getDocumentation(productId: string): Promise<ProductDocumentation[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('product_documentation')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error(`Error fetching documentation for project ${productId}:`, error)
            return []
        }

        return data as ProductDocumentation[]
    }

    static async createDocumentation(doc: Partial<ProductDocumentation>): Promise<ProductDocumentation | null> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('product_documentation')
            .insert(doc)
            .select()
            .single()

        if (error) {
            console.error('Error creating product documentation:', error)
            return null
        }

        return data as ProductDocumentation
    }
}

import { PrismaClient } from '@prisma/client'

export class DatabaseHelper {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect()
      console.log('Base de datos conectada exitosamente')
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      console.log('Base de datos desconectada exitosamente')
    } catch (error) {
      console.error('Error al desconectar de la base de datos:', error)
    }
  }

  getPrisma(): PrismaClient {
    return this.prisma
  }

  async transaction<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn)
  }

  async findUnique(model: string, where: any): Promise<any> {
    try {
      return await (this.prisma as any)[model].findUnique({ where })
    } catch (error) {
      throw new Error(`Error al buscar ${model}: ${error}`)
    }
  }

  async findMany(model: string, options?: any): Promise<any[]> {
    try {
      return await (this.prisma as any)[model].findMany(options)
    } catch (error) {
      throw new Error(`Error al buscar ${model}: ${error}`)
    }
  }

  async create(model: string, data: any): Promise<any> {
    try {
      return await (this.prisma as any)[model].create({ data })
    } catch (error) {
      throw new Error(`Error al crear ${model}: ${error}`)
    }
  }

  async update(model: string, where: any, data: any): Promise<any> {
    try {
      return await (this.prisma as any)[model].update({ where, data })
    } catch (error) {
      throw new Error(`Error al actualizar ${model}: ${error}`)
    }
  }

  async delete(model: string, where: any): Promise<any> {
    try {
      return await (this.prisma as any)[model].delete({ where })
    } catch (error) {
      throw new Error(`Error al eliminar ${model}: ${error}`)
    }
  }

  async count(model: string, where?: any): Promise<number> {
    try {
      return await (this.prisma as any)[model].count({ where })
    } catch (error) {
      throw new Error(`Error al contar ${model}: ${error}`)
    }
  }
} 
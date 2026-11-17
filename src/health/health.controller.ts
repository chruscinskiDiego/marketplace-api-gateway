import { Controller, Get, Param } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthCheckService } from 'src/common/health/health-check.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthStatus } from 'src/common/health/health-check.interface';

@Controller('health')
export class HealthController {

    constructor(
        private readonly healthService: HealthService,
        private readonly healthCheckService: HealthCheckService
    ) { }

    @Get()
    @ApiOperation({ summary: 'Health check do gateway' })
    @ApiResponse({ status: 200, description: 'Gateway está saudável' })
    async getHealth() {

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            update: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version
        }
    }

    @Get('services')
    @ApiOperation({ summary: 'Health check do gateway' })//mudar
    @ApiResponse({ status: 200, description: 'Gateway está saudável' })//mudar
    async getServicesHealth() {

        const services = await this.healthCheckService.checkAllServices();

        const overallStatus = services.every((s) => s.status === HealthStatus.HEALTHY)
            ? HealthStatus.HEALTHY
            : services.some((s) => s.status === HealthStatus.HEALTHY) ? HealthStatus.DEGRADED
                : HealthStatus.UNHEALTHY;

        return {
            overallStatus,
            timestamp: new Date().toISOString(),
            services,
            summary: {
                total: services.length,
                healthy: services.filter((s) => s.status === HealthStatus.HEALTHY).length,
                unhealthy: services.filter((s) => s.status === HealthStatus.UNHEALTHY).length,
                degraded: services.filter((s) => s.status === HealthStatus.DEGRADED).length,
            }
        }
    }

    @Get('services/:serviceName')
    @ApiOperation({ summary: 'Health check do gateway' })//mudar
    @ApiResponse({ status: 200, description: 'Gateway está saudável' })//mudar
    async getServiceHealth(@Param('serviceName') serviceName: string) {

        const cached = this.healthCheckService.getCachedHealth(serviceName);

        if (!cached) {

            return {
                status: 'unknown',
                message: 'Service not found or never checked',
                timestamp: new Date().toISOString()
            }

        }

        return cached;
    }

    @Get('ready')
    @ApiOperation({ summary: 'Health check do gateway' })//mudar
    @ApiResponse({ status: 200, description: 'Gateway está saudável' })//mudar
    async getReady() {

        return this.healthService.getReadyStatus();

    }

    @Get('live')
    @ApiOperation({ summary: 'Health check do gateway' })//mudar
    @ApiResponse({ status: 200, description: 'Gateway está saudável' })//mudar
    async getLive() {

        return this.healthService.getLiveStatus();
        
    }
}



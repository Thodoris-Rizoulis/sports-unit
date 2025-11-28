# Quickstart: DB Services Refactor

**Date**: November 26, 2025  
**Feature**: 005-db-services-refactor

## Overview

The refactoring introduces a reusable DB pool and service layers for better code organization.

## Setup

1. Ensure PostgreSQL DB is running with existing schema.
2. Set environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME.

## Usage

- Services are in `services/` directory.
- Import and use static methods, e.g., `SportsService.getSports()`.
- API routes updated to use services; no changes to endpoints.

## Testing

- Run `npm run dev` and test API endpoints.
- Verify responses match original behavior.

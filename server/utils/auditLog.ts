/**
 * Log an audit event to the database.
 * Fire-and-forget: errors are caught and logged, never thrown.
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  userId?: string | null,
  metadata?: Record<string, any>,
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId: userId || null,
        metadata: metadata || undefined,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to log:", { action, entityType, entityId }, error);
  }
}

'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'
import { Opportunity, CatalogItem } from '@/types'

// Estilos Core
const primaryBlue = '#1e3a8a'
const textMain = '#1e293b'
const textLight = '#64748b'
const borderLight = '#f1f5f9'

const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        color: textMain,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        width: 120,
    },
    headerMeta: {
        textAlign: 'right',
    },
    headerLabel: {
        fontSize: 8,
        color: textLight,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerValue: {
        fontSize: 9,
        color: textMain,
        fontWeight: 'bold',
    },
    titleSection: {
        marginTop: 40,
        marginBottom: 60,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: primaryBlue,
        lineHeight: 1.1,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 3,
        color: textLight,
        borderLeft: 2,
        borderLeftColor: primaryBlue,
        paddingLeft: 10,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: 'bold',
        color: primaryBlue,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 20,
        borderBottom: 1,
        borderBottomColor: borderLight,
        paddingBottom: 8,
    },
    paragraph: {
        fontSize: 11,
        lineHeight: 1.8,
        color: textMain,
    },
    list: {
        marginTop: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    listItemText: {
        fontSize: 10.5,
        lineHeight: 1.6,
        color: textMain,
        flex: 1,
    },
    // Cronograma
    timelineCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 25,
        marginTop: 20,
    },
    timelineInfo: {
        fontSize: 9,
        color: textLight,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    // Condiciones
    conditionsBox: {
        marginTop: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: borderLight,
        borderRadius: 12,
    },
    // Tabla de inversión
    table: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: borderLight,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: borderLight,
        padding: '12 15',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: borderLight,
        padding: '12 15',
    },
    col1: { width: '55%', fontSize: 10, fontWeight: 'bold' },
    col2: { width: '25%', fontSize: 9, color: textLight, textAlign: 'center' },
    col3: { width: '20%', fontSize: 10, fontWeight: 'bold', textAlign: 'right' },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: textMain,
        padding: '20 15',
        color: '#FFFFFF',
    },
    // Firmas
    signatureWrapper: {
        marginTop: 'auto',
        paddingBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '40%',
        borderTop: 1,
        borderTopColor: '#cbd5e1',
        paddingTop: 15,
    },
    signatureLabel: {
        fontSize: 8,
        color: textLight,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 25,
        right: 50,
        fontSize: 8,
        color: textLight,
    },
    branding: {
        position: 'absolute',
        bottom: 25,
        left: 50,
        fontSize: 8,
        color: textLight,
        fontWeight: 'bold',
    }
})

// Componente de Viñeta Corporativa (Checkmark)
const CustomBullet = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 10, marginTop: 2 }}>
        <Path
            d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"
            fill="#021133"
        />
    </Svg>
)

// Header Reutilizable
const MinimalHeader = ({ today, refId }: { today: string; refId: string }) => (
    <View style={styles.header}>
        <Image src="/brand/logo-blue.png" style={styles.logo} />
        <View style={styles.headerMeta}>
            <Text style={styles.headerLabel}>Propuesta de Valor</Text>
            <Text style={styles.headerValue}>{today} • {refId}</Text>
        </View>
    </View>
)

interface ProposalData {
    objective: string
    validity: number
    paymentTerms: string
    portalHeadline: string
    portalSubheadline: string
    deliverables: string
    deliveryTimeText: string
    revisionRounds: string
    notIncluded: string
}

interface Props {
    opportunity: Opportunity
    catalog: CatalogItem[]
    proposal: ProposalData
}

export const ExecutiveDocument = ({ opportunity, catalog, proposal }: Props) => {
    const draft = opportunity?.draft_jsonb
    const dimensionDisplay = opportunity?.dimension === 'landing' ? 'Landing Page' :
        opportunity?.dimension === 'website' ? 'Sitio Web Corporativo' : 'Aplicación Web Pro'

    const today = new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    const refId = opportunity?.id ? `OPT-${opportunity.id.slice(0, 8).toUpperCase()}` : 'REF-UNKNOWN'

    const getCatalogItem = (id: string | null) => catalog.find(i => i.id === id)

    // Extraer tech bullets de los bloques seleccionados con seguridad
    const techBullets = (draft?.blocks || [])
        .map(b => {
            const item = getCatalogItem(opportunity?.dimension === 'landing' ? b.complexity_id : b.catalog_item_id)
            return item?.tech_bullet
        })
        .filter(Boolean) as string[]

    return (
        <Document title={`Propuesta_${opportunity.client?.razon_social || 'Executive'}`}>

            {/* PÁGINA 1: VALOR ESTRATÉGICO */}
            <Page size="A4" style={styles.page}>
                <MinimalHeader today={today} refId={refId} />

                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>{proposal.portalHeadline || `Propuesta Ejecutiva de Desarrollo: ${dimensionDisplay}`}</Text>
                    <Text style={styles.subtitle}>{proposal.portalSubheadline || 'Protocolo Fortex Digital Solutions'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Objetivo Estratégico</Text>
                    <Text style={styles.paragraph}>{proposal.objective}</Text>
                    {opportunity.financials_jsonb?.roi_estimate && (
                        <Text style={[styles.paragraph, { marginTop: 10, fontWeight: 'bold', color: primaryBlue }]}>
                            ROI Estimado: {opportunity.financials_jsonb.roi_estimate}
                        </Text>
                    )}
                </View>

                {opportunity.discovery_jsonb?.pain_points && opportunity.discovery_jsonb.pain_points.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Puntos de Dolor Identificados</Text>
                        <View style={styles.list}>
                            {opportunity.discovery_jsonb.pain_points.slice(0, 3).map((point, i) => (
                                <View key={i} style={styles.listItem}>
                                    <CustomBullet />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.listItemText, { fontWeight: 'bold' }]}>{point.problem}</Text>
                                        <Text style={[styles.listItemText, { fontSize: 9, opacity: 0.8 }]}>{point.impact}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Especificaciones del Ecosistema</Text>
                    <View style={styles.list}>
                        <View style={styles.listItem}>
                            <CustomBullet />
                            <Text style={styles.listItemText}>Arquitectura basada en Next.js App Router para máximo rendimiento y SEO nativo.</Text>
                        </View>
                        <View style={styles.listItem}>
                            <CustomBullet />
                            <Text style={styles.listItemText}>Infraestructura Edge Runtime con baja latencia y alta disponibilidad global.</Text>
                        </View>
                        {techBullets.map((bullet, i) => (
                            <View key={i} style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>{bullet}</Text>
                            </View>
                        ))}
                        <View style={styles.listItem}>
                            <CustomBullet />
                            <Text style={styles.listItemText}>Propiedad Intelectual: Entrega total de código fuente sin dependencias de terceros (Lock-in).</Text>
                        </View>
                    </View>
                </View>

                {proposal.deliverables && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Entregables de Solución</Text>
                        <Text style={styles.paragraph}>{proposal.deliverables}</Text>
                    </View>
                )}

                <Text style={styles.branding}>FORTEX DIGITAL SOLUTIONS</Text>
                <Text style={styles.pageNumber}>1 / 3</Text>
            </Page>

            {/* PÁGINA 2: EJECUCIÓN Y TÉRMINOS */}
            <Page size="A4" style={styles.page}>
                <MinimalHeader today={today} refId={refId} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Metodología y Cronograma</Text>
                    <View style={styles.timelineCard}>
                        <Text style={styles.timelineInfo}>Estimación: {proposal.deliveryTimeText || '3 a 5 semanas laborables'}. El tiempo inicia a partir de la entrega total de activos y aprobación de objetivos.</Text>

                        <View style={styles.list}>
                            <View style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>Fase 01: Onboarding y Discovery Estratégico (Semana 1)</Text>
                            </View>
                            <View style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>Fase 02: Arquitectura y Desarrollo de Núcleo (Semana 2-4)</Text>
                            </View>
                            <View style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>Fase 03: Pruebas de Estrés y Despliegue en Producción (Semana 5)</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Condiciones Comerciales</Text>
                    <View style={styles.conditionsBox}>
                        <View style={styles.list}>
                            <View style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>Esquema de Inversión: {proposal.paymentTerms}</Text>
                            </View>
                            <View style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>Validez del Instrumento: {proposal.validity} días naturales.</Text>
                            </View>
                            <View style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>Rondas de Revisión: {proposal.revisionRounds || '2 rondas incluidas'}.</Text>
                            </View>
                            <View style={styles.listItem}>
                                <CustomBullet />
                                <Text style={styles.listItemText}>Impuestos: Todos los montos incluyen IGV conforme a ley.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {proposal.notIncluded && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Exclusiones y Alcance</Text>
                        <View style={styles.conditionsBox}>
                            <Text style={[styles.paragraph, { fontSize: 10, color: '#ef4444' }]}>
                                No se incluye en esta propuesta: {proposal.notIncluded}
                            </Text>
                        </View>
                    </View>
                )}

                <Text style={styles.branding}>FORTEX DIGITAL SOLUTIONS</Text>
                <Text style={styles.pageNumber}>2 / 3</Text>
            </Page>

            {/* PÁGINA 3: INVERSIÓN Y CIERRE */}
            <Page size="A4" style={styles.page}>
                <MinimalHeader today={today} refId={refId} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Inversión Detallada (Capex)</Text>

                    <View style={styles.table}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={styles.col1}>Componente de Solución</Text>
                            <Text style={styles.col2}>Arquitectura</Text>
                            <Text style={styles.col3}>Inversión (S/)</Text>
                        </View>

                        {(draft?.blocks || []).map((block, index) => {
                            const item = getCatalogItem(opportunity?.dimension === 'landing' ? block.complexity_id : block.catalog_item_id)
                            return (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.col1}>{block.name || `Componente ${index + 1}`}</Text>
                                    <Text style={styles.col2}>{item?.client_label || '-'}</Text>
                                    <Text style={styles.col3}>{item ? `S/ ${item.base_price_pen.toLocaleString()}` : '-'}</Text>
                                </View>
                            )
                        })}

                        {(draft?.selectedModules || []).map((sm, index) => (
                            <View key={`mod-${index}`} style={styles.tableRow}>
                                <Text style={styles.col1}>{getCatalogItem(sm.id)?.name}</Text>
                                <Text style={styles.col2}>Módulo Core</Text>
                                <Text style={styles.col3}>S/ {getCatalogItem(sm.id)?.base_price_pen.toLocaleString() || '0'}</Text>
                            </View>
                        ))}

                        <View style={styles.totalRow}>
                            <Text style={[styles.col1, { color: '#FFFFFF', fontSize: 13 }]}>TOTAL INVERSIÓN FINAL</Text>
                            <Text style={styles.col2}></Text>
                            <Text style={[styles.col3, { color: '#FFFFFF', fontSize: 14 }]}>
                                S/ {(draft?.totalCalculated || 0).toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    {(draft?.totalOpex || 0) > 0 && (
                        <View style={{ marginTop: 20 }}>
                            <Text style={[styles.paragraph, { fontSize: 10, fontWeight: 'bold' }]}>
                                Soporte Cloud y Mantenimiento (OPEX): S/ {draft?.totalOpex.toLocaleString()} / mensual.
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.signatureWrapper} wrap={false}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Por Fortex Digital Solutions</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Por {opportunity.client?.razon_social || 'El Cliente'}</Text>
                    </View>
                </View>

                <Text style={styles.branding}>FORTEX DIGITAL SOLUTIONS</Text>
                <Text style={styles.pageNumber}>3 / 3</Text>
            </Page>
        </Document>
    )
}

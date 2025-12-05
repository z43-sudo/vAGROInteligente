-- ============================================================================
-- SETUP SIMPLIFICADO - PARTE 2: POLÍTICAS RLS
-- ============================================================================
-- Execute este arquivo DEPOIS da Parte 1
-- ============================================================================

-- Políticas para admin_users
CREATE POLICY "admin_users_select_authenticated" ON public.admin_users
    FOR SELECT TO authenticated USING (true);

-- Políticas para user_profiles
CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

-- Políticas para crops
CREATE POLICY "crops_select" ON public.crops
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "crops_insert" ON public.crops
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "crops_update" ON public.crops
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "crops_delete" ON public.crops
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Políticas para activities
CREATE POLICY "activities_select" ON public.activities
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "activities_insert" ON public.activities
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "activities_update" ON public.activities
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "activities_delete" ON public.activities
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Políticas para machines
CREATE POLICY "machines_select" ON public.machines
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "machines_insert" ON public.machines
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "machines_update" ON public.machines
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "machines_delete" ON public.machines
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Políticas para livestock
CREATE POLICY "livestock_select" ON public.livestock
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "livestock_insert" ON public.livestock
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "livestock_update" ON public.livestock
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "livestock_delete" ON public.livestock
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Políticas para inventory_items
CREATE POLICY "inventory_select" ON public.inventory_items
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "inventory_insert" ON public.inventory_items
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "inventory_update" ON public.inventory_items
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "inventory_delete" ON public.inventory_items
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Políticas para chat_messages
CREATE POLICY "chat_select" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "chat_insert" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

SELECT '✅ PARTE 2 COMPLETA - Políticas RLS criadas!' as status;

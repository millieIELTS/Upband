-- 크레딧 차감 RPC에 reason 파라미터 지원 추가
-- 사용처: 일반 라이팅(writing_feedback) vs 모의고사(mock_test) 구분

create or replace function deduct_credit_with_reason(p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
  set credits = greatest(credits - 1, 0)
  where id = auth.uid();

  insert into credit_logs (user_id, amount, reason)
  values (auth.uid(), -1, p_reason);
end;
$$;

grant execute on function deduct_credit_with_reason(text) to authenticated;
